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
    <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
      Check your email to confirm your account before logging in.
    </p>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-parchment-50 px-6 dark:bg-navy-950">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
          Log in
        </h1>

        <Suspense fallback={null}>
          <ConfirmBanner />
        </Suspense>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-navy-800 dark:text-parchment-200">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-parchment-200 bg-parchment-50 px-3 py-2 text-navy-950 outline-none focus:border-crimson-600 dark:border-navy-700 dark:bg-navy-900 dark:text-parchment-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-navy-800 dark:text-parchment-200">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-parchment-200 bg-parchment-50 px-3 py-2 text-navy-950 outline-none focus:border-crimson-600 dark:border-navy-700 dark:bg-navy-900 dark:text-parchment-50"
            />
          </label>

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-crimson-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-crimson-700 disabled:opacity-50"
          >
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-navy-700 dark:text-parchment-200">
          No account?{" "}
          <Link href="/signup" className="font-medium text-navy-950 dark:text-parchment-50">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
