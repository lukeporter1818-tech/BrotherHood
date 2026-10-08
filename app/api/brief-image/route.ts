import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createClient } from "@/lib/supabase/server";

// Returns the preview image (og:image) of a brief story's source article,
// streamed through our server so members' browsers never contact the
// publisher directly. Signed-in members only. Any failure => 404 and the
// card falls back to its letter tile.

export const runtime = "nodejs";

const HTML_LIMIT = 600_000; // bytes of HTML we are willing to read
const IMAGE_LIMIT = 2_500_000; // bytes of image we are willing to return
const TIMEOUT_MS = 4000;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// url -> resolved image url (or null). Small in-memory cache per server instance.
const ogCache = new Map<string, { image: string | null; at: number }>();
const OG_TTL_MS = 6 * 60 * 60 * 1000;
const OG_CACHE_MAX = 500;

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::") return true;
    if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb")) return true;
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isPrivateIp(mapped[1]) : false;
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

async function assertPublicHttps(raw: string): Promise<URL> {
  const u = new URL(raw);
  if (u.protocol !== "https:") throw new Error("https only");
  if (u.username || u.password) throw new Error("credentials in url");
  if (u.port && u.port !== "443") throw new Error("port");
  const host = u.hostname;
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("host");
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error("private address");
  return u;
}

// fetch with manual redirects, re-validating every hop.
async function safeFetch(raw: string, accept: string): Promise<Response> {
  let current = raw;
  for (let hop = 0; hop < 4; hop++) {
    const u = await assertPublicHttps(current);
    const res = await fetch(u, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept, "user-agent": "BrotherhoodLinkPreview/1.0" },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("redirect without location");
      current = new URL(loc, u).toString();
      continue;
    }
    return res;
  }
  throw new Error("too many redirects");
}

async function readCapped(res: Response, limit: number): Promise<Uint8Array> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("no body");
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error("too large");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function metaContent(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i");
    const m = html.match(re1) ?? html.match(re2);
    if (m) return m[1].replace(/&amp;/g, "&");
  }
  return null;
}

async function findImageUrl(articleUrl: string): Promise<string | null> {
  const cached = ogCache.get(articleUrl);
  if (cached && Date.now() - cached.at < OG_TTL_MS) return cached.image;

  let image: string | null = null;
  try {
    const res = await safeFetch(articleUrl, "text/html");
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && type.includes("text/html")) {
      const html = new TextDecoder().decode(await readCapped(res, HTML_LIMIT));
      const found = metaContent(html, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]);
      if (found) image = new URL(found, articleUrl).toString();
    }
  } catch {
    image = null;
  }
  if (ogCache.size >= OG_CACHE_MAX) ogCache.clear();
  ogCache.set(articleUrl, { image, at: Date.now() });
  return image;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  const target = new URL(request.url).searchParams.get("u");
  if (!target || target.length > 2000) return new Response(null, { status: 400 });

  try {
    const imageUrl = await findImageUrl(target);
    if (!imageUrl) return new Response(null, { status: 404 });

    const res = await safeFetch(imageUrl, "image/*");
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!res.ok || !ALLOWED_IMAGE_TYPES.includes(type)) return new Response(null, { status: 404 });

    const bytes = await readCapped(res, IMAGE_LIMIT);
    return new Response(bytes as BodyInit, {
      status: 200,
      headers: {
        "content-type": type,
        "cache-control": "private, max-age=86400",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
