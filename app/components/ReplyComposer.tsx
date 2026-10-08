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
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="postId" value={postId} />
      <div className="flex h-[45px] items-center overflow-hidden rounded-full border border-signal/50 bg-surface pl-5 focus-within:border-signal">
        <textarea
          name="body"
          rows={1}
          maxLength={2000}
          placeholder="Write a reply…"
          className="h-[37px] flex-1 resize-none border-0 bg-transparent py-[6px] text-[16px] leading-6 text-text placeholder:text-[14px] placeholder:text-text-muted focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={pending}
          aria-label={pending ? "Sending" : "Send reply"}
          className="flex h-full w-14 shrink-0 items-center justify-center bg-[#89F6BD] text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (
            "…"
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          )}
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
