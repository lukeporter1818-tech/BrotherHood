// Six muted, dark-mode-safe hues for distinguishing users inside a thread.
// Chosen to avoid clashing with signal mint (#98DF9B) and crisis red (#B5544A).
export const IDENTITY_COLORS = [
  "#5C8AA3",
  "#B5A15C",
  "#7FA87F",
  "#A3708C",
  "#8C7FB0",
  "#8C7A5C",
] as const;

// Fixed neutral for Goose. Deliberately outside IDENTITY_COLORS so Goose
// never collides with a user hash.
export const GOOSE_MARKER_COLOR = "#8C969B";

export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function identityColorFor(userId: string): string {
  return IDENTITY_COLORS[fnv1a(userId) % IDENTITY_COLORS.length];
}
