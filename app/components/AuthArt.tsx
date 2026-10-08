/* Decorative bottom artwork for the logged-out screens (landing, login, sign up). */
export function AuthArt() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/art/auth-bottom.png"
        alt=""
        className="block w-full"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 22%, #000 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 22%, #000 90%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
