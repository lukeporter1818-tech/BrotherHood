"use client";

import { useActionState, useEffect, useRef } from "react";
import { useIdentity } from "@/app/components/IdentityProvider";
import { createReply, type PostActionState } from "@/app/rooms/actions";

const initialState: PostActionState = { error: null };

export function ReplyComposer({
  postId,
  roomSlug,
}: {
  postId: string;
  roomSlug: string;
}) {
  const { identity } = useIdentity();
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
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="roomSlug" value={roomSlug} />
      <input type="hidden" name="identity" value={identity} />
      <textarea
        name="body"
        rows={2}
        maxLength={2000}
        placeholder="Reply…"
        className="w-full resize-none bg-transparent text-sm text-zinc-950 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-50"
        required
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Replying as{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {identity === "REAL" ? "real name" : "anon"}
          </span>
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-950 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
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
