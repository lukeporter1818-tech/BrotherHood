import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-parchment-50 px-6 text-center dark:bg-navy-950">
      <h1 className="text-4xl font-semibold tracking-tight text-navy-950 dark:text-parchment-50">
        Brotherhood
      </h1>
      <p className="mt-3 max-w-md text-navy-700 dark:text-parchment-200">
        Not therapy. The on-ramp to it. Show up, post honestly, check in daily.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-crimson-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-crimson-700"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-parchment-200 px-5 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-parchment-100 dark:border-navy-700 dark:text-parchment-50 dark:hover:bg-navy-800"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
