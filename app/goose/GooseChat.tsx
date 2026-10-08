"use client";

import {
  Fragment,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { CrisisResources } from "@/app/components/CrisisResources";
import { CRISIS_RAIL_TEXT } from "@/lib/crisis-rail";
import {
  Thread,
  ThreadAvatar,
  ThreadEntry,
} from "@/app/components/ThreadEntry";
import { sendGooseMessage, type ClientMessage } from "@/app/goose/actions";
import { useKeyboardInset } from "@/app/components/useKeyboardInset";

const BODY_MAX = 4096;

export function GooseChat({
  initialMessages,
  currentUserAnonHandle,
}: {
  initialMessages: ClientMessage[];
  currentUserAnonHandle: string;
}) {
  const [messages, setMessages] = useState<ClientMessage[]>(initialMessages);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: ClientMessage[], newMessage: ClientMessage) => [
      ...state,
      newMessage,
    ],
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useKeyboardInset();

  const hasScrolledOnce = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = optimisticMessages[optimisticMessages.length - 1];

    // When Goose's reply arrives, line the top of the reply up with the top
    // of the view so it can be read from the start. Everything else (opening
    // the chat, sending a message, "Goose is thinking") goes to the bottom.
    if (hasScrolledOnce.current && !pending && last?.role === "ASSISTANT") {
      const items = el.querySelectorAll("li");
      const lastItem = items[items.length - 1];
      if (lastItem) {
        const top =
          lastItem.getBoundingClientRect().top -
          el.getBoundingClientRect().top +
          el.scrollTop -
          8;
        el.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        return;
      }
    }

    hasScrolledOnce.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [optimisticMessages, pending]);

  function handleSubmit(formData: FormData) {
    const text = String(formData.get("body") ?? "").trim();
    if (!text) return;

    formRef.current?.reset();
    setError(null);

    startTransition(async () => {
      addOptimisticMessage({
        id: `optimistic-${Date.now()}`,
        role: "USER",
        content: text,
        escalated: false,
        riskLevel: null,
        createdAt: new Date().toISOString(),
      });

      const result = await sendGooseMessage(text);
      if (result.error !== null) {
        setError(result.error);
        return;
      }
      setMessages((prev) => [
        ...prev,
        result.userMessage,
        result.assistantMessage,
      ]);
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
    <div className="flex min-h-[70dvh] flex-1 flex-col">
      <div
        ref={scrollRef}
        data-chat-scroll
        className="flex-1 overflow-y-auto py-6"
        style={{ maxHeight: "calc(100dvh - 16rem)" }}
      >
        {isEmpty ? (
          <EmptyState />
        ) : (
          <Thread>
            {optimisticMessages.map((msg) =>
              renderMessage(msg, currentUserAnonHandle),
            )}
            {pending && <ThinkingIndicator />}
          </Thread>
        )}
      </div>
      <form
        ref={formRef}
        action={handleSubmit}
        data-chat-composer
        className="sticky bottom-(--chat-bottom) p-[14px]"
      >
        {error && (
          <p className="mb-2 text-xs text-red-400">{error}</p>
        )}
        <div className="flex h-[45px] items-center overflow-hidden rounded-full border border-signal/50 bg-surface pl-5 focus-within:border-signal">
          <textarea
            name="body"
            rows={1}
            maxLength={BODY_MAX}
            placeholder="Say what's on your mind…"
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

function renderMessage(msg: ClientMessage, currentUserAnonHandle: string) {
  const isUser = msg.role === "USER";

  if (isUser) {
    return (
      <ThreadEntry
        key={msg.id}
        author={{ kind: "self", anonHandle: currentUserAnonHandle }}
        timestamp={msg.createdAt}
        body={msg.content}
        size={44}
        variant="solid"
        density="chat"
      />
    );
  }

  if (msg.escalated) {
    const idx = msg.content.indexOf(CRISIS_RAIL_TEXT);
    const prose =
      idx === -1
        ? msg.content
        : (
            msg.content.slice(0, idx) +
            msg.content.slice(idx + CRISIS_RAIL_TEXT.length)
          ).trim();

    return (
      <Fragment key={msg.id}>
        <li className="relative z-10 overflow-hidden rounded-lg border-2 border-crisis bg-surface">
          <div className="bg-crisis/10 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-crisis">
              Get help now
            </p>
            <CrisisResources />
          </div>
        </li>
        {prose && (
          <ThreadEntry
            author={{ kind: "goose" }}
            timestamp={msg.createdAt}
            body={prose}
            size={44}
            variant="solid"
            density="chat"
          />
        )}
      </Fragment>
    );
  }

  return (
    <ThreadEntry
      key={msg.id}
      author={{ kind: "goose" }}
      timestamp={msg.createdAt}
      body={msg.content}
      size={44}
      variant="solid"
      density="chat"
    />
  );
}

function ThinkingIndicator() {
  return (
    <li className="relative" style={{ paddingLeft: 65 }}>
      <div className="absolute left-0 top-0">
        <ThreadAvatar author={{ kind: "goose" }} size={44} variant="solid" />
      </div>
      <p className="pt-1 text-[16px] italic text-text-muted">Goose is thinking…</p>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <h2 className="text-lg font-semibold text-text">
        Goose
      </h2>
      <p className="max-w-md text-sm text-text-muted">
        Private 1-on-1 chat. Not a therapist — a first-responder who can help
        you name what you&apos;re feeling and know where to turn. Say what&apos;s on your
        mind.
      </p>
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
