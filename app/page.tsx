import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-text">
        Brotherhood
      </h1>
      <p className="mt-3 max-w-md text-text-muted">
        Not therapy. The on-ramp to it. Show up, post honestly, check in daily.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-surface border-2 border-signal px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-signal/10"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
