// Server-compatible component. No hooks, no "use client". Rendered in both
// the CrisisButton modal and the /crisis fallback page so the copy can never
// drift between them. The text version used by Goose AI responses lives in
// lib/crisis-rail.ts — keep both in sync.

export function CrisisResources() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          988 Suicide &amp; Crisis Lifeline
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          <a
            href="tel:988"
            className="font-medium text-crisis underline underline-offset-2 hover:text-crisis/80"
          >
            Call or text 988
          </a>
          . Free, confidential, available 24/7.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-text">
          Crisis Text Line
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          <a
            href="sms:741741?&body=HOME"
            className="font-medium text-crisis underline underline-offset-2 hover:text-crisis/80"
          >
            Text HOME to 741741
          </a>
          . Free, confidential, available 24/7.
        </p>
      </div>
    </div>
  );
}
