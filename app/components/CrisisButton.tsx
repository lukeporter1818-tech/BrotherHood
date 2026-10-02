"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { CrisisResources } from "@/app/components/CrisisResources";

// PRODUCT DECISION (2026-09-03): The Crisis Rail FAB is deliberately
// scoped to Rooms and Bench only, NOT app-wide. Rationale — Luke made
// this call after an explicit safety-tradeoff discussion. Do NOT expand
// this to other routes without a fresh safety review. The Goose in-chat
// escalation card (GooseChat.tsx "Get help now" branch) is a SEPARATE
// crisis surface driven by the tripwire classifier and is unaffected
// by this FAB scoping.
const ALLOWED_ROUTES = new Set(["rooms", "bench"]);

export function CrisisButton() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const firstSegment = pathname.split("/")[1] ?? "";
  if (!ALLOWED_ROUTES.has(firstSegment)) return null;

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
        className="fixed right-4 bottom-4 z-50 rounded-full border-2 border-crisis bg-surface px-4 py-1.5 text-sm font-semibold text-text shadow-md transition-colors hover:bg-crisis/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-crisis"
      >
        Get help
      </a>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby="crisis-dialog-title"
        className="w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-0 text-text shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="crisis-dialog-title"
              className="text-lg font-semibold text-text"
            >
              You&rsquo;re not alone.
            </h2>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close"
              className="-mr-2 -mt-2 rounded-full p-2 text-text-muted hover:bg-elevated hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-text-muted"
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

          <p className="mt-1 text-sm text-text-muted">
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
