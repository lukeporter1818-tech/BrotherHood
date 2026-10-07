"use client";

import Image from "next/image";
import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={56}
            height={56}
            priority
            className="shrink-0"
          />
          <h1 className="mt-6 text-2xl font-bold text-text sm:text-3xl">
            Create your account.
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Join Brotherhood.
          </p>
        </div>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text outline-none focus:border-signal sm:text-sm"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text outline-none focus:border-signal sm:text-sm"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Anon handle
            <input
              name="anonHandle"
              type="text"
              required
              minLength={2}
              maxLength={24}
              placeholder="e.g. QuietStorm22"
              className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text outline-none focus:border-signal sm:text-sm"
            />
            <span className="mt-1 text-xs font-normal normal-case tracking-normal text-text-muted">
              What you post under when you&apos;re not using your real name.
            </span>
          </label>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-mint-bright disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-signal hover:text-mint-bright">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
