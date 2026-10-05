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
    <div className="flex min-h-[60vh] flex-1 flex-col rounded border border-border bg-surface">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6"
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
              />
            ))}
          </Thread>
        )}
      </div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="border-t border-border p-4"
      >
        {error && (
          <p className="mb-2 text-xs text-red-400">{error}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            name="body"
            rows={2}
            maxLength={BODY_MAX}
            placeholder="Enter to send, Shift+Enter for a new line."
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none rounded border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-signal focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-surface border-2 border-signal px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-signal/10 disabled:opacity-50 glow-signal-md"
          >
            {pending ? "…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
