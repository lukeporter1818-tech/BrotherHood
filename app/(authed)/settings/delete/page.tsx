"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  deleteAccount,
  type DeleteAccountState,
} from "./actions";

const initialState: DeleteAccountState = { error: null };

export default function DeleteAccountPage() {
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialState,
  );
  const [confirmText, setConfirmText] = useState("");
  const canSubmit = confirmText.trim() === "DELETE" && !pending;

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6 px-5 py-8">
      <div>
        <Link
          href="/settings"
          className="text-sm text-signal hover:text-signal-bright"
        >
          ← Back to settings
        </Link>
        <h1 className="mt-4 text-[24px] font-semibold text-text">
          Delete your account
        </h1>
        <p className="mt-1 text-[15px] text-text-muted">
          This cannot be undone. Read what happens before you confirm.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4 text-[14px] leading-6 text-text/90">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-text-muted">
          What stays
        </h2>
        <ul className="mt-2 list-disc pl-5 text-text/90">
          <li>
            A post you wrote that other men replied to is{" "}
            <strong>kept as a <code>[deleted]</code> placeholder</strong>, so
            the replies they left still make sense. The words you wrote are
            erased.
          </li>
        </ul>
        <h2 className="mt-5 text-[13px] font-semibold uppercase tracking-widest text-text-muted">
          What is permanently deleted
        </h2>
        <ul className="mt-2 list-disc pl-5 text-text/90">
          <li>
            <strong>Every post and reply you wrote.</strong> A post others
            replied to is kept as a <code>[deleted]</code> placeholder (see
            above), but the body is wiped.
          </li>
          <li>
            Your <strong>Bench chats</strong> with other men — deleted for{" "}
            <strong>both sides</strong>.
          </li>
          <li>Your Goose chat history.</li>
          <li>Your daily check-ins and your personal brief history.</li>
          <li>Your room availability signals.</li>
          <li>Your email, phone, handle, and admin status on your profile.</li>
          <li>Your login — you will be signed out and cannot sign back in.</li>
        </ul>
      </section>

      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-2 text-[14px] text-text">
          Type <strong>DELETE</strong> to confirm.
          <input
            name="confirm"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="h-[42px] w-full rounded-[10px] border border-text/20 bg-surface px-4 text-base text-text outline-none focus:border-crisis"
          />
        </label>

        {state.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 flex h-[44px] w-full items-center justify-center rounded-[10px] border border-crisis bg-crisis/90 px-5 text-[17px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Deleting…" : "Delete my account"}
        </button>
        <Link
          href="/settings"
          className="text-center text-[14px] text-text-muted hover:text-text"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
}
