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
          className="w-full resize-y rounded border border-parchment-200 bg-parchment-50 px-3 py-2 text-sm text-navy-950 focus:border-crimson-600 focus:outline-none dark:border-navy-700 dark:bg-navy-950 dark:text-parchment-50"
        />
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded px-3 py-1 text-xs font-medium bg-crimson-600 text-white hover:bg-crimson-700 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={pending}
            className="rounded px-3 py-1 text-xs text-navy-700 hover:text-navy-950 dark:text-parchment-200 dark:hover:text-parchment-50"
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
        <span className="text-xs text-navy-700 dark:text-parchment-200">
          Delete this?
        </span>
        <button
          onClick={handleConfirmDelete}
          disabled={pending}
          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={handleCancelDelete}
          disabled={pending}
          className="text-xs text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
        >
          Cancel
        </button>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleEdit}
        className="text-xs text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
      >
        Delete
      </button>
    </div>
  );
}
