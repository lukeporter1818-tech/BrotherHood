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
      className="rounded border border-border bg-surface p-4"
    >
      <input type="hidden" name="postId" value={postId} />
      <textarea
        name="body"
        rows={2}
        maxLength={2000}
        placeholder="Reply…"
        className="w-full resize-none bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
        required
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-surface border-2 border-signal px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-signal/10 disabled:opacity-50 glow-signal-md"
        >
          {pending ? "Sending…" : "Reply"}
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-xs text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
