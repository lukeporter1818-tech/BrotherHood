"use client";

import Image from "next/image";
import { useActionState } from "react";
import Link from "next/link";
import { AuthArt, ArrowRightIcon } from "@/app/components/AuthArt";
import { signup, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

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

      <div className="relative z-10 w-full max-w-[325px] pt-6">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/icons/bh-glyph.png"
            alt=""
            width={66}
            height={79}
            priority
            className="h-[79px] w-[66px] shrink-0"
          />
          <p className="mt-2 text-[14px] font-medium uppercase tracking-[0.4em] text-signal-bright">
            Brotherhood
          </p>
          <h1 className="mt-6 text-[28px] font-semibold leading-tight text-text">
            Create your account
          </h1>
          <p className="mt-1 max-w-[260px] text-[16px] leading-6 text-subhead">
            Join a private community of men supporting each other.
          </p>
        </div>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
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
                minLength={8}
                autoComplete="new-password"
                className="h-[42px] w-full rounded-[10px] border border-text/20 bg-surface pl-[54px] pr-4 text-base text-text outline-none placeholder:text-[14px] placeholder:text-subhead/60 focus:border-signal"
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-[14px] font-medium text-text">
            Anonymous handle
            <span className="relative block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-4 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-text/80" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
              </svg>
              <input
                name="anonHandle"
                type="text"
                required
                minLength={2}
                maxLength={24}
                placeholder="Choose a handle"
                className="h-[42px] w-full rounded-[10px] border border-text/20 bg-surface pl-[54px] pr-4 text-base text-text outline-none placeholder:text-[14px] placeholder:text-subhead/60 focus:border-signal"
              />
            </span>
            <span className="text-[13px] font-normal leading-[18px] text-subhead">
              This is the name other members will see.
              <br />
              No real names. No photos.
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
            {pending ? "Creating account…" : "Sign up"}
            <ArrowRightIcon className="absolute right-5 h-5 w-5" />
          </button>
        </form>

        <p className="mt-4 text-center text-[15px] text-text/80">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-signal hover:text-mint-bright">
            Log in
          </Link>
        </p>
      </div>

      <AuthArt />
    </div>
  );
}
