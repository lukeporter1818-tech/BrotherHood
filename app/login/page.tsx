"use client";

import Image from "next/image";
import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Log in to Brotherhood.
          </p>
        </div>

        <Suspense fallback={null}>
          <ConfirmBanner />
        </Suspense>

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
              autoComplete="current-password"
              className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text outline-none focus:border-signal sm:text-sm"
            />
          </label>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-mint-bright disabled:opacity-50"
          >
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-signal hover:text-mint-bright">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
