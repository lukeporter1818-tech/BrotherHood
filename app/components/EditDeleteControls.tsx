"use client";

import { useState, useTransition } from "react";
import {
  editPost,
  deletePost,
  editReply,
  deleteReply,
} from "@/app/rooms/actions";

const BODY_MAX = 2000;

type Props =
  | { type: "post"; id: string; body: string }
  | { type: "reply"; id: string; body: string };

export function EditDeleteControls({ type, id, body }: Props) {
  const [mode, setMode] = useState<"idle" | "editing" | "confirming">("idle");
  const [editBody, setEditBody] = useState(body);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEdit() {
    setEditBody(body);
    setMode("editing");
    setError(null);
  }

  function handleCancelEdit() {
    setMode("idle");
    setError(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result =
        type === "post"
          ? await editPost(id, editBody)
          : await editReply(id, editBody);
      if (result.error) {
        setError(result.error);
      } else {
        setMode("idle");
      }
    });
  }

  function handleDelete() {
    setMode("confirming");
    setError(null);
  }

  function handleCancelDelete() {
    setMode("idle");
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      const result =
        type === "post" ? await deletePost(id) : await deleteReply(id);
      if (result.error) {
        setError(result.error);
        setMode("idle");
      }
    });
  }

  if (mode === "editing") {
    return (
      <div className="mt-2 flex flex-col gap-2">
        <textarea
          value={editBody}
          onChange={(e) => setEditBody(e.target.value)}
          maxLength={BODY_MAX}
          rows={3}
          className="w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm text-text focus:border-signal focus:outline-none"
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded px-3 py-3 text-xs font-medium bg-signal text-white hover:bg-signal/90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={pending}
            className="rounded px-3 py-3 text-xs text-text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === "confirming") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">
          Delete this?
        </span>
        <button
          onClick={handleConfirmDelete}
          disabled={pending}
          className="inline-flex items-center min-h-[44px] px-2 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={handleCancelDelete}
          disabled={pending}
          className="inline-flex items-center min-h-[44px] px-2 text-xs text-text-muted hover:text-text"
        >
          Cancel
        </button>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleEdit}
        className="inline-flex items-center min-h-[44px] px-2 text-xs text-text-muted hover:text-text"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center min-h-[44px] px-2 text-xs text-text-muted hover:text-red-400"
      >
        Delete
      </button>
    </div>
  );
}
