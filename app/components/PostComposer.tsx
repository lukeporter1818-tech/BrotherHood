"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPost, type PostActionState } from "@/app/rooms/actions";

const initialState: PostActionState = { error: null };

type Props = { roomSlug: string; squadId?: never } | { roomSlug?: never; squadId: string };

export function PostComposer(props: Props) {
  const [state, formAction, pending] = useActionState(createPost, initialState);
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
      {props.roomSlug ? (
        <input type="hidden" name="roomSlug" value={props.roomSlug} />
      ) : (
        <input type="hidden" name="squadId" value={props.squadId} />
      )}
      <textarea
        name="body"
        rows={3}
        maxLength={2000}
        placeholder="What's on your mind?"
        className="w-full resize-none bg-transparent text-sm text-navy-950 placeholder:text-slate-400 focus:outline-none dark:text-parchment-50"
        required
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-crimson-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-crimson-700 disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post"}
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
