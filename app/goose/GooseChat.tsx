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
    <div className="flex min-h-[70vh] flex-1 flex-col rounded border border-border bg-surface">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6"
        style={{ maxHeight: "calc(100vh - 16rem)" }}
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
            placeholder="Say what's on your mind."
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

function renderMessage(msg: ClientMessage, currentUserAnonHandle: string) {
  const isUser = msg.role === "USER";

  if (isUser) {
    return (
      <ThreadEntry
        key={msg.id}
        author={{ kind: "self", anonHandle: currentUserAnonHandle }}
        timestamp={msg.createdAt}
        body={msg.content}
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
    />
  );
}

function ThinkingIndicator() {
  return (
    <li className="relative pl-10">
      <div className="absolute left-0 top-0">
        <ThreadAvatar author={{ kind: "goose" }} />
      </div>
      <p className="pt-1 text-sm italic text-text-muted">Goose is thinking…</p>
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
        you name what you're feeling and know where to turn. Say what's on your
        mind.
      </p>
    </div>
  );
}
