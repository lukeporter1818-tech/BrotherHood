import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, AuthArt } from "@/app/components/AuthArt";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden px-[18px] pt-16 text-center">
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Image
          src="/icons/bh-glyph.png"
          alt=""
          width={148}
          height={176}
          priority
          className="h-[176px] w-[148px] shrink-0"
        />
        <h1 className="mt-4 text-[22px] font-medium uppercase tracking-[0.4em] text-signal-bright">
          Brotherhood
        </h1>
        <p className="mt-4 max-w-[340px] text-[12px] uppercase leading-5 tracking-[0.22em] text-subhead">
          Real men. Real conversations. Better tomorrows.
        </p>

        <div aria-hidden="true" className="mt-5 flex w-full max-w-[225px] items-center gap-3 text-text-muted">
          <span className="h-px flex-1 bg-text/20" />
          <span className="text-[13px]">★</span>
          <span className="h-px flex-1 bg-text/20" />
        </div>

        <p className="mt-6 max-w-[270px] text-[15.5px] leading-[22px] text-text/80">
          A private men&apos;s wellness community for real conversations, support, and a stronger tomorrow.
        </p>

        <div className="mt-8 flex w-full max-w-[285px] flex-col gap-3">
          <Link
            href="/signup"
            className="relative flex h-[46px] items-center justify-center rounded-[10px] border border-signal bg-[#89F6BD] text-[17px] font-semibold text-bg glow-signal-md transition-opacity hover:opacity-90"
          >
            Sign up
            <ArrowRightIcon className="absolute right-5 h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="relative flex h-[40px] items-center justify-center rounded-[10px] border border-signal/50 text-[16px] font-medium text-text transition-colors hover:bg-signal/10"
          >
            Log in
            <ArrowRightIcon className="absolute right-5 h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>
      <AuthArt />
    </div>
  );
}
