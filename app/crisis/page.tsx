import Link from "next/link";
import { CrisisResources } from "@/app/components/CrisisResources";

export const metadata = {
  title: "Crisis resources — Brotherhood",
  description: "Free, confidential crisis support, available 24/7.",
};

export default function CrisisPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-text">
        You&rsquo;re not alone.
      </h1>
      <p className="mt-2 text-text-muted">
        If you&rsquo;re in crisis, one of these can help right now.
      </p>

      <div className="mt-8 rounded-lg border border-crisis bg-surface p-6">
        <CrisisResources />
      </div>

      <Link
        href="/"
        className="mt-8 text-sm text-text-muted hover:text-text"
      >
        ← Back
      </Link>
    </div>
  );
}
