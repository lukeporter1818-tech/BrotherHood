import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={160}
        height={160}
        priority
        className="shrink-0"
      />
      <h1 className="mt-6 text-3xl font-bold uppercase tracking-widest text-text sm:text-4xl">
        Brotherhood
      </h1>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
        Real men. Real conversations. Better tomorrows.
      </p>

      <div className="mt-10 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-mint-bright"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
