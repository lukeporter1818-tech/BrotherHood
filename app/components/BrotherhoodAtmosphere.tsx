"use client";

import { usePathname } from "next/navigation";

type Variant =
  | "landing"
  | "auth"
  | "home"
  | "goose"
  | "rooms"
  | "thread"
  | "bench"
  | "bench-chat"
  | "crisis"
  | "admin";

// strength: how visible the approved background plate is on each screen.
// fadeBottom: landing/auth draw their own mountain art at the bottom.
const VARIANTS: Record<Variant, { strength: number; fadeBottom: boolean }> = {
  landing: { strength: 1, fadeBottom: true },
  auth: { strength: 0.9, fadeBottom: true },
  home: { strength: 1, fadeBottom: false },
  rooms: { strength: 1, fadeBottom: false },
  bench: { strength: 0.9, fadeBottom: false },
  thread: { strength: 0.5, fadeBottom: false },
  goose: { strength: 0.5, fadeBottom: false },
  "bench-chat": { strength: 0.5, fadeBottom: false },
  admin: { strength: 0.45, fadeBottom: false },
  crisis: { strength: 0.15, fadeBottom: false },
};

function variantFor(pathname: string): Variant {
  if (pathname === "/") return "landing";
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return "auth";
  if (pathname.startsWith("/goose")) return "goose";
  if (pathname.startsWith("/crisis")) return "crisis";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/bench/match")) return "bench-chat";
  if (pathname.startsWith("/bench")) return "bench";
  if (pathname.startsWith("/rooms/")) return "thread";
  if (pathname.startsWith("/rooms")) return "rooms";
  return "home";
}

const PLATE = "url('/brand/art/atmosphere-plate.webp')";
const SIDE_MASK_LEFT =
  "linear-gradient(to right, #000 0%, #000 55%, transparent 100%)";
const SIDE_MASK_RIGHT =
  "linear-gradient(to left, #000 0%, #000 55%, transparent 100%)";

const FADE_BOTTOM =
  "linear-gradient(to bottom, #000 0%, #000 58%, transparent 80%)";

export function BrotherhoodAtmosphere() {
  const pathname = usePathname() ?? "/";
  const v = VARIANTS[variantFor(pathname)];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Phone: the plate fills the screen. */}
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat md:hidden"
        style={{
          backgroundImage: PLATE,
          opacity: v.strength,
          maskImage: v.fadeBottom ? FADE_BOTTOM : undefined,
          WebkitMaskImage: v.fadeBottom ? FADE_BOTTOM : undefined,
        }}
      />
      {/* Desktop: art lives in the side margins; the center stays quiet. */}
      <div
        className="absolute inset-y-0 left-0 hidden w-1/2 bg-no-repeat md:block"
        style={{
          backgroundImage: PLATE,
          backgroundSize: "auto 100%",
          backgroundPosition: "left top",
          opacity: v.strength,
          maskImage: SIDE_MASK_LEFT,
          WebkitMaskImage: SIDE_MASK_LEFT,
        }}
      />
      <div
        className="absolute inset-y-0 right-0 hidden w-1/2 bg-no-repeat md:block"
        style={{
          backgroundImage: PLATE,
          backgroundSize: "auto 100%",
          backgroundPosition: "right top",
          opacity: v.strength,
          maskImage: SIDE_MASK_RIGHT,
          WebkitMaskImage: SIDE_MASK_RIGHT,
        }}
      />
    </div>
  );
}
