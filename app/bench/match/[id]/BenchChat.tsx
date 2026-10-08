"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import {
  sendBenchMessage,
  type ClientBenchMessage,
} from "@/app/bench/match/[id]/actions";
import { Thread, ThreadEntry } from "@/app/components/ThreadEntry";

const BODY_MAX = 4096;

export function BenchChat({
  matchId,
  currentUserId,
  currentUserAnonHandle,
  initialMessages,
}: {
  matchId: string;
  currentUserId: string;
  currentUserAnonHandle: string;
  initialMessages: ClientBenchMessage[];
}) {
  const [messages, setMessages] =
    useState<ClientBenchMessage[]>(initialMessages);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: ClientBenchMessage[], newMessage: ClientBenchMessage) => [
      ...state,
      newMessage,
    ],
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [optimisticMessages, pending]);

  function handleSubmit(formData: FormData) {
    const text = String(formData.get("body") ?? "").trim();
    if (!text) return;

    formRef.current?.reset();
    setError(null);

    startTransition(async () => {
      addOptimisticMessage({
        id: `optimistic-${Date.now()}`,
        senderId: currentUserId,
        content: text,
        senderAnonHandle: currentUserAnonHandle,
        createdAt: new Date().toISOString(),
      });

      const result = await sendBenchMessage({
        matchId,
        content: text,
      });
      if (result.error !== null) {
        setError(result.error);
        return;
      }
      setMessages((prev) => [...prev, result.message]);
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  const isEmpty = optimisticMessages.length === 0 && !pending;

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-6"
        style={{ maxHeight: "calc(100vh - 20rem)" }}
      >
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-text-muted">
            No messages yet. Say hello when you&apos;re ready.
          </div>
        ) : (
          <Thread>
            {optimisticMessages.map((msg) => (
              <ThreadEntry
                key={msg.id}
                author={
                  msg.senderId === currentUserId
                    ? { kind: "self", anonHandle: currentUserAnonHandle }
                    : { kind: "other", userId: msg.senderId, label: msg.senderAnonHandle }
                }
                timestamp={msg.createdAt}
                body={msg.content}
                size={44}
                variant="solid"
                density="chat"
              />
            ))}
          </Thread>
        )}
      </div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="p-[14px]"
      >
        {error && (
          <p className="mb-2 text-xs text-red-400">{error}</p>
        )}
        <div className="flex h-[45px] items-center overflow-hidden rounded-full border border-signal/50 bg-surface pl-5 focus-within:border-signal">
          <textarea
            name="body"
            rows={1}
            maxLength={BODY_MAX}
            placeholder="Write a message…"
            onKeyDown={handleKeyDown}
            className="h-[37px] flex-1 resize-none border-0 bg-transparent py-[6px] text-[16px] leading-6 text-text placeholder:text-[14px] placeholder:text-text-muted focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={pending}
            aria-label="Send"
            className="flex h-full w-14 shrink-0 items-center justify-center bg-[#89F6BD] text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "…" : <SendIcon className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M3.4 20.4 21 12 3.4 3.6 3 10l12 2-12 2 .4 6.4z" />
    </svg>
  );
}
