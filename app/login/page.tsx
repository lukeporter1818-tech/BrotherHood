"use client";

import Image from "next/image";
import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthArt, ArrowRightIcon } from "@/app/components/AuthArt";
import { login, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = { error: null };

function ConfirmBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("confirm") !== "1") return null;

  return (
    <p className="mt-6 rounded-xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-text-muted">
      Check your email to confirm your account before logging in.
    </p>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden px-[18px] pt-6 pb-10">
      <Link
        href="/"
        aria-label="Back"
        className="absolute left-[18px] top-6 text-signal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
          <path d="M20 12H5" />
          <path d="M11 6l-6 6 6 6" />
        </svg>
      </Link>

      <div className="relative z-10 w-full max-w-[325px] pt-14">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/icons/bh-glyph.png"
            alt=""
            width={84}
            height={100}
            priority
            className="h-[100px] w-[84px] shrink-0"
          />
          <p className="mt-2 text-[14px] font-medium uppercase tracking-[0.4em] text-signal-bright">
            Brotherhood
          </p>
          <h1 className="mt-6 text-[28px] font-semibold leading-tight text-text">
            Welcome back.
          </h1>
          <p className="mt-1 text-[16px] text-subhead">
            Log in to Brotherhood.
          </p>
        </div>

        <Suspense fallback={null}>
          <ConfirmBanner />
        </Suspense>

        <form action={formAction} className="mt-7 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-text">
            Email
            <span className="relative block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-4 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-text/80" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
              </svg>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@domain.com"
                className="h-[42px] w-full rounded-[10px] border border-text/20 bg-surface pl-[54px] pr-4 text-base text-text outline-none placeholder:text-[14px] placeholder:text-subhead/60 focus:border-signal"
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-text">
            Password
            <span className="relative block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-4 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-text/80" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="10" rx="2" />
                <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
              </svg>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-[42px] w-full rounded-[10px] border border-text/20 bg-surface pl-[54px] pr-4 text-base text-text outline-none focus:border-signal"
              />
            </span>
          </label>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="relative mt-1 flex h-[44px] w-full items-center justify-center rounded-[10px] border border-signal bg-[#89F6BD] px-5 text-[17px] font-semibold text-bg glow-signal-md transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Logging in…" : "Log in"}
            <ArrowRightIcon className="absolute right-5 h-5 w-5" />
          </button>
        </form>

        <p className="mt-5 text-center text-[15px] text-text/80">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-signal hover:text-mint-bright">
            Sign up
          </Link>
        </p>
      </div>

      <AuthArt />
    </div>
  );
}
