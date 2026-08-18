import Link from "next/link";
import { CrisisResources } from "@/app/components/CrisisResources";

export const metadata = {
  title: "Crisis resources — Brotherhood",
  description: "Free, confidential crisis support, available 24/7.",
};

export default function CrisisPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        You&rsquo;re not alone.
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        If you&rsquo;re in crisis, one of these can help right now.
      </p>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <CrisisResources />
      </div>

      <Link
        href="/"
        className="mt-8 text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← Back
      </Link>
    </div>
  );
}
