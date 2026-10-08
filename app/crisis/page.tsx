import Link from "next/link";
import { CrisisResources } from "@/app/components/CrisisResources";

export const metadata = {
  title: "Crisis resources — Brotherhood",
  description: "Free, confidential crisis support, available 24/7.",
};

export default function CrisisPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-[18px] pt-4 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-3 self-start text-[16px] text-signal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
          <path d="M20 12H5" />
          <path d="M11 6l-6 6 6 6" />
        </svg>
        Back
      </Link>

      <div className="mt-6 flex flex-col items-center text-center">
        <svg viewBox="0 0 48 48" fill="none" className="h-[54px] w-[54px]" aria-hidden="true">
          <path d="M24 5 44 40H4L24 5Z" fill="#B5544A" fillOpacity="0.25" stroke="#B5544A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M24 18v10" stroke="#F1F6F3" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="34" r="1.8" fill="#F1F6F3" />
        </svg>
        <h1 className="mt-3 text-[28px] font-semibold text-text">Check In</h1>
        <p className="mt-2 max-w-[300px] text-[17px] leading-6 text-subhead">
          You&rsquo;re not alone. If you&rsquo;re in crisis, one of these can help right now.
        </p>
      </div>

      <div className="mt-6">
        <CrisisResources />
      </div>
    </div>
  );
}
