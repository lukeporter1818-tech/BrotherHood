// Server-compatible component. No hooks, no "use client". Rendered in both
// the CrisisButton modal and the /crisis fallback page so the copy can never
// drift between them.

export function CrisisResources() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          988 Suicide &amp; Crisis Lifeline
        </h3>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          <a
            href="tel:988"
            className="font-medium text-zinc-950 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            Call or text 988
          </a>
          . Free, confidential, available 24/7.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Crisis Text Line
        </h3>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          <a
            href="sms:741741?&body=HOME"
            className="font-medium text-zinc-950 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            Text HOME to 741741
          </a>
          . Free, confidential, available 24/7.
        </p>
      </div>
    </div>
  );
}
