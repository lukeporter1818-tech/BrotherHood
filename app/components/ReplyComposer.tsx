"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReply, type PostActionState } from "@/app/rooms/actions";

const initialState: PostActionState = { error: null };

export function ReplyComposer({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(createReply, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error && formRef.current) {
      formRef.current.reset();
    }
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900"
    >
      <input type="hidden" name="postId" value={postId} />
      <textarea
        name="body"
        rows={2}
        maxLength={2000}
        placeholder="Reply…"
        className="w-full resize-none bg-transparent text-sm text-navy-950 placeholder:text-slate-400 focus:outline-none dark:text-parchment-50"
        required
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-crimson-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-crimson-700 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Reply"}
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
