"use client";

import { useRef } from "react";
import { CrisisResources } from "@/app/components/CrisisResources";

export function CrisisButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog(e: React.MouseEvent<HTMLAnchorElement>) {
    // Progressive enhancement: without JS, the anchor navigates to /crisis
    // and this handler never fires. With JS, we intercept and open the modal.
    if (!dialogRef.current) return;
    e.preventDefault();
    dialogRef.current.showModal();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    // Native <dialog> fires onClick for backdrop clicks with the dialog itself
    // as the target. Clicks on inner content have inner elements as targets.
    if (e.target === dialogRef.current) {
      dialogRef.current.close();
    }
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <a
        href="/crisis"
        onClick={openDialog}
        className="fixed right-4 bottom-4 z-50 rounded-full border-2 border-amber-500 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-950 shadow-md transition-colors hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-amber-950/40"
      >
        Get help
      </a>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby="crisis-dialog-title"
        className="w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-0 text-zinc-950 shadow-2xl backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="crisis-dialog-title"
              className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
            >
              You&rsquo;re not alone.
            </h2>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close"
              className="-mr-2 -mt-2 rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            If you&rsquo;re in crisis, one of these can help right now.
          </p>

          <div className="mt-5">
            <CrisisResources />
          </div>
        </div>
      </dialog>
    </>
  );
}
