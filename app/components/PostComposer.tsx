"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPost, type PostActionState } from "@/app/(authed)/rooms/actions";

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
      className="relative overflow-hidden rounded-[14px] border border-border bg-surface p-[14px] pb-[46px]"
    >
      {props.roomSlug ? (
        <input type="hidden" name="roomSlug" value={props.roomSlug} />
      ) : (
        <input type="hidden" name="squadId" value={props.squadId} />
      )}
      <textarea
        name="body"
        rows={2}
        maxLength={2000}
        placeholder="What's on your mind?"
        className="w-full resize-none bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="absolute bottom-0 right-0 flex h-[40px] w-[88px] items-center justify-center rounded-tl-[12px] bg-signal text-[14px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Posting…" : "Post"}
      </button>
      {state.error && (
        <p className="mt-2 pr-24 text-xs text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
