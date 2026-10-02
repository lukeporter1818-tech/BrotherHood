"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = { error: null };

function ConfirmBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("confirm") !== "1") return null;

  return (
    <p className="mt-4 rounded-md bg-blue-950 px-3 py-2 text-sm text-blue-200">
      Check your email to confirm your account before logging in.
    </p>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-text">
          Log in
        </h1>

        <Suspense fallback={null}>
          <ConfirmBanner />
        </Suspense>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-signal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-signal"
            />
          </label>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-surface border-2 border-signal px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-signal/10 disabled:opacity-50"
          >
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-text-muted">
          No account?{" "}
          <Link href="/signup" className="font-medium text-text">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
