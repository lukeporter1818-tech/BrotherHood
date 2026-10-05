import { type ReactNode } from "react";
import {
  GOOSE_MARKER_COLOR,
  identityColorFor,
} from "@/lib/thread/identity";

export type Author =
  | { kind: "self"; anonHandle: string }
  | { kind: "goose" }
  | { kind: "other"; userId: string; label: string };

function resolveAuthor(author: Author): {
  color: string;
  tint: string;
  label: string;
  initial: string;
} {
  if (author.kind === "self") {
    const initial = author.anonHandle.charAt(0).toUpperCase() || "?";
    return {
      color: "var(--color-signal)",
      tint: "color-mix(in oklab, var(--color-signal) 15%, transparent)",
      label: "you",
      initial,
    };
  }
  if (author.kind === "goose") {
    return {
      color: GOOSE_MARKER_COLOR,
      tint: `${GOOSE_MARKER_COLOR}26`,
      label: "Goose",
      initial: "G",
    };
  }
  const color = identityColorFor(author.userId);
  const initial = author.label.charAt(0).toUpperCase() || "?";
  return {
    color,
    tint: `${color}26`,
    label: author.label,
    initial,
  };
}

function formatTimestamp(ts: Date | string): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function Thread({ children }: { children: ReactNode }) {
  return (
    <ol className="relative flex flex-col gap-5">
      {children}
    </ol>
  );
}

export function ThreadAvatar({
  author,
  tone = "normal",
}: {
  author: Author;
  tone?: "normal" | "removed";
}) {
  if (tone === "removed") {
    return (
      <div
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-surface text-xs text-text-muted"
        aria-hidden
      >
        —
      </div>
    );
  }
  const { color, tint, initial } = resolveAuthor(author);
  return (
    <div
      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-surface text-xs font-medium"
      style={{
        backgroundColor: "var(--color-surface)",
        backgroundImage: `linear-gradient(${tint}, ${tint})`,
        borderColor: color,
        color,
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function ThreadEntry({
  author,
  timestamp,
  body,
  children,
  edited = false,
  tone = "normal",
}: {
  author: Author;
  timestamp: Date | string;
  body: ReactNode;
  children?: ReactNode;
  edited?: boolean;
  tone?: "normal" | "removed";
}) {
  const { color, label } = resolveAuthor(author);
  const removed = tone === "removed";

  return (
    <li className="relative pl-10">
      <div className="absolute left-0 top-0">
        <ThreadAvatar author={author} tone={tone} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={
            removed
              ? "text-sm italic text-text-muted"
              : "text-sm font-medium text-text"
          }
        >
          {removed ? "[removed]" : label}
        </span>
        <span className="font-mono text-xs text-text-muted">
          {formatTimestamp(timestamp)}
          {edited && !removed && (
            <span className="text-text-muted/60"> · edited</span>
          )}
        </span>
      </div>
      <div
        className={
          removed
            ? "mt-1 border-l-2 border-border pl-3"
            : "mt-1 border-l-2 pl-3"
        }
        style={removed ? undefined : { borderColor: color }}
      >
        <div
          className={
            removed
              ? "whitespace-pre-wrap break-words text-sm italic text-text-muted/60"
              : "whitespace-pre-wrap break-words text-sm text-text"
          }
        >
          {body}
        </div>
        {children && !removed && <div className="mt-2">{children}</div>}
      </div>
    </li>
  );
}
