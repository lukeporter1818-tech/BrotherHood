import Image from "next/image";

export function ProfileAvatar({ anonHandle }: { anonHandle: string }) {
  return (
    <div
      aria-label={`Profile: ${anonHandle}`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-elevated"
    >
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={20}
        height={20}
        className="shrink-0"
      />
    </div>
  );
}
