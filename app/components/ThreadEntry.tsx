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

function formatChatTimestamp(ts: Date | string): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return formatTimestamp(d);
}

function formatRelativeTimestamp(ts: Date | string): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days <= 30) return `${days}d ago`;
  return formatTimestamp(d);
}

// Solid-variant fills — scoped here so ring/bar colors elsewhere stay
// driven by identity.ts and --color-signal.
const SOLID_FILL_SELF = "#8BF6BF";
const SOLID_FILL_GOOSE = "#91979D";

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
  size = 32,
  variant = "ring",
}: {
  author: Author;
  tone?: "normal" | "removed";
  size?: number;
  variant?: "ring" | "solid";
}) {
  if (tone === "removed") {
    if (size === 32) {
      return (
        <div
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-surface text-xs text-text-muted"
          aria-hidden
        >
          —
        </div>
      );
    }
    return (
      <div
        className="relative z-10 flex items-center justify-center rounded-full border-2 border-border bg-surface text-text-muted"
        style={{ height: size, width: size, fontSize: 12 }}
        aria-hidden
      >
        —
      </div>
    );
  }
  const { color, tint, initial } = resolveAuthor(author);

  if (variant === "solid") {
    const fill =
      author.kind === "self"
        ? SOLID_FILL_SELF
        : author.kind === "goose"
          ? SOLID_FILL_GOOSE
          : color;
    return (
      <div
        className="relative z-10 flex items-center justify-center rounded-full font-semibold"
        style={{
          height: size,
          width: size,
          backgroundColor: fill,
          color: "var(--color-bg)",
          fontSize: Math.round(size * 0.45),
        }}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  if (size === 32) {
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

  return (
    <div
      className="relative z-10 flex items-center justify-center rounded-full border-2 bg-surface font-medium"
      style={{
        height: size,
        width: size,
        backgroundColor: "var(--color-surface)",
        backgroundImage: `linear-gradient(${tint}, ${tint})`,
        borderColor: color,
        color,
        fontSize: Math.round(size * 0.42),
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
  size = 32,
  variant = "ring",
  density = "default",
}: {
  author: Author;
  timestamp: Date | string;
  body: ReactNode;
  children?: ReactNode;
  edited?: boolean;
  tone?: "normal" | "removed";
  size?: number;
  variant?: "ring" | "solid";
  density?: "default" | "chat" | "feed";
}) {
  const { color, label } = resolveAuthor(author);
  const removed = tone === "removed";
  const chat = density === "chat";
  const feed = density === "feed";

  const avatarAuthor: Author =
    chat && author.kind === "self"
      ? { kind: "self", anonHandle: "You" }
      : author;
  const displayLabel = chat && author.kind === "self" ? "You" : label;
  const timeString = feed
    ? formatRelativeTimestamp(timestamp)
    : chat
      ? formatChatTimestamp(timestamp)
      : formatTimestamp(timestamp);

  if (feed) {
    return (
      <li className="relative py-[14px]" style={{ paddingLeft: size + 11 }}>
        <div className="absolute left-0 top-[14px]">
          <ThreadAvatar
            author={avatarAuthor}
            tone={tone}
            size={size}
            variant={variant}
          />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={
              removed
                ? "text-sm italic text-text-muted"
                : "text-[14px] font-medium text-text"
            }
          >
            {removed ? "[removed]" : displayLabel}
          </span>
          <span className="text-[14px] text-text-muted">
            {timeString}
            {edited && !removed && (
              <span className="text-text-muted/60"> · edited</span>
            )}
          </span>
        </div>
        <div
          className={
            removed
              ? "mt-1 border-l-2 border-border pl-3"
              : "mt-1 border-l-2"
          }
          style={removed ? undefined : { borderColor: color, paddingLeft: 14 }}
        >
          <div
            className={
              removed
                ? "whitespace-pre-wrap break-words text-sm italic text-text-muted/60"
                : "whitespace-pre-wrap break-words text-sm leading-5 text-text"
            }
          >
            {body}
          </div>
          {children && !removed && <div className="mt-2">{children}</div>}
        </div>
      </li>
    );
  }

  return (
    <li
      className={chat ? "relative" : "relative pl-10"}
      style={chat ? { paddingLeft: size + 21 } : undefined}
    >
      <div className="absolute left-0 top-0">
        <ThreadAvatar
          author={avatarAuthor}
          tone={tone}
          size={size}
          variant={variant}
        />
      </div>
      <div
        className={
          chat
            ? "flex items-baseline justify-start gap-3"
            : "flex items-baseline justify-between gap-2"
        }
      >
        <span
          className={
            removed
              ? "text-sm italic text-text-muted"
              : chat
                ? "text-[14px] font-semibold text-text"
                : "text-sm font-medium text-text"
          }
        >
          {removed ? "[removed]" : displayLabel}
        </span>
        <span
          className={
            chat
              ? "font-mono text-[13px] text-text-muted"
              : "font-mono text-xs text-text-muted"
          }
        >
          {timeString}
          {edited && !removed && (
            <span className="text-text-muted/60"> · edited</span>
          )}
        </span>
      </div>
      <div
        className={
          removed
            ? "mt-1 border-l-2 border-border pl-3"
            : chat
              ? "mt-1 border-l-2"
              : "mt-1 border-l-2 pl-3"
        }
        style={
          removed
            ? undefined
            : chat
              ? { borderColor: color, paddingLeft: 13 }
              : { borderColor: color }
        }
      >
        <div
          className={
            removed
              ? "whitespace-pre-wrap break-words text-sm italic text-text-muted/60"
              : chat
                ? "max-w-[230px] whitespace-pre-wrap break-words text-[16px] leading-6 text-text/90"
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
