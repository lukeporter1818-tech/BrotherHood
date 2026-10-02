"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-text">
          Sign up
        </h1>

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
              minLength={8}
              autoComplete="new-password"
              className="rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-signal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Anon handle
            <input
              name="anonHandle"
              type="text"
              required
              minLength={2}
              maxLength={24}
              placeholder="e.g. QuietStorm22"
              className="rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-signal"
            />
            <span className="text-xs text-text-muted">
              What you post under when you&apos;re not using your real name.
            </span>
          </label>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal/90 disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-text">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
