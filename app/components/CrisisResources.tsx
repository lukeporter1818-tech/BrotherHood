// Server-compatible component. No hooks, no "use client". Rendered in both
// the CrisisButton modal and the /crisis fallback page so the copy can never
// drift between them. The text version used by Goose AI responses lives in
// lib/crisis-rail.ts — keep both in sync.

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function ResourceRow({
  href,
  title,
  detail,
  icon,
}: {
  href: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-[12px] border border-crisis/50 bg-surface p-[10px] pr-4 transition-colors hover:border-crisis"
    >
      <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[10px] bg-crisis/15 text-crisis">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-medium leading-5 text-text">
          {title}
        </span>
        <span className="mt-0.5 block text-[13.5px] leading-[18px] text-subhead">
          {detail}
        </span>
      </span>
      <ChevronIcon className="h-5 w-5 shrink-0 text-text/80" />
    </a>
  );
}

export function CrisisResources() {
  return (
    <div className="flex flex-col gap-3">
      <ResourceRow
        href="tel:988"
        title="Call or text 988"
        detail="988 Suicide & Crisis Lifeline. Free, confidential, available 24/7."
        icon={<PhoneIcon className="h-6 w-6" />}
      />
      <ResourceRow
        href="sms:741741?&body=HOME"
        title="Text HOME to 741741"
        detail="Crisis Text Line. Free, confidential, available 24/7."
        icon={<ChatIcon className="h-6 w-6" />}
      />
    </div>
  );
}
