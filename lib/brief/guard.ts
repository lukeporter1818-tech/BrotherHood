import "server-only";

type GuardResult = { blocked: false } | { blocked: true; reason: string };

const BLOCKED_PATTERNS: RegExp[] = [
  // Sexual / explicit
  /\bporn(ography|ographic)?\b/i,
  /\bxxx\b/i,
  /\bhentai\b/i,
  /\berotica?\b/i,
  /\bsex\s+tape\b/i,
  /\bcam(girl|boy)\b/i,

  // Illegal how-to
  /\bbomb[\s-]?making\b/i,
  /\b(make|build|construct)\b.{0,15}\bbomb\b/i,
  /\bdrug[\s-]?synthesis\b/i,
  /\b(make|cook|synthesize)\b.{0,20}\b(meth(amphetamine)?|fentanyl|heroin|cocaine|crack)\b/i,
  /\bchild\s+(porn(ography)?|sexual\s+abuse|exploitation|grooming)\b/i,
  /\bcsam\b/i,

  // Slurs
  /\bn[i1]gg[ae]r\b/i,
  /\bk[i1]ke\b/i,
  /\bf[a4]gg[o0]t\b/i,
  /\bsp[i1]c\b/i,
  /\bch[i1]nk\b/i,
  /\bw[e3]tb[a4]ck\b/i,
  /\btr[a4]nny\b/i,
];

export function checkTopics(topics: string[]): GuardResult {
  const combined = topics.join(" ");
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(combined)) {
      return {
        blocked: true,
        reason: "That topic isn't something we can generate a brief on.",
      };
    }
  }
  return { blocked: false };
}
