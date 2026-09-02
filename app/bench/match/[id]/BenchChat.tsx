"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { useIdentity } from "@/app/components/IdentityProvider";
import {
  sendBenchMessage,
  type ClientBenchMessage,
} from "@/app/bench/match/[id]/actions";

const BODY_MAX = 4096;

export function BenchChat({
  matchId,
  currentUserId,
  initialMessages,
}: {
  matchId: string;
  currentUserId: string;
  initialMessages: ClientBenchMessage[];
}) {
  const { anonHandle } = useIdentity();
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
        identityUsed: "ANON",
        senderRealName: null,
        senderAnonHandle: anonHandle,
        createdAt: new Date().toISOString(),
      });

      const result = await sendBenchMessage({
        matchId,
        content: text,
        identityUsed: "ANON",
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
    <div className="flex min-h-[60vh] flex-1 flex-col rounded border border-parchment-200 bg-parchment-50 dark:border-navy-800 dark:bg-navy-900">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6"
        style={{ maxHeight: "calc(100vh - 20rem)" }}
      >
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-slate-500">
            No messages yet. Say hello when you&apos;re ready.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {optimisticMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSelf={msg.senderId === currentUserId}
              />
            ))}
          </div>
        )}
      </div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="border-t border-parchment-200 p-4 dark:border-navy-800"
      >
        {error && (
          <p className="mb-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            name="body"
            rows={2}
            maxLength={BODY_MAX}
            placeholder="Enter to send, Shift+Enter for a new line."
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none rounded border border-parchment-200 bg-parchment-50 px-3 py-2 text-sm text-navy-950 placeholder:text-slate-400 focus:border-crimson-600 focus:outline-none dark:border-navy-700 dark:bg-navy-950 dark:text-parchment-50"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-crimson-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-crimson-700 disabled:opacity-50"
          >
            {pending ? "…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  isSelf,
}: {
  message: ClientBenchMessage;
  isSelf: boolean;
}) {
  const displayName =
    message.identityUsed === "REAL" && message.senderRealName
      ? message.senderRealName
      : message.senderAnonHandle;

  return (
    <div className={isSelf ? "flex justify-end" : "flex justify-start"}>
      <div className="flex max-w-[85%] flex-col gap-1">
        <p
          className={`text-xs text-slate-500 ${isSelf ? "text-right" : "text-left"}`}
        >
          {displayName}
        </p>
        <div
          className={
            isSelf
              ? "rounded-2xl bg-navy-900 px-4 py-2 text-sm text-parchment-50 dark:bg-navy-800"
              : "rounded-2xl bg-parchment-100 px-4 py-2 text-sm text-navy-950 dark:bg-navy-700 dark:text-parchment-50"
          }
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
