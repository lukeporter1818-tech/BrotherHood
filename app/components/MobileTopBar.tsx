import Image from "next/image";
import Link from "next/link";
import { HeaderMenu } from "@/app/components/HeaderMenu";

type Props = { isAdmin: boolean };

export function MobileTopBar({ isAdmin }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3">
      <Link href="/home" className="flex items-center gap-2">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={22}
          height={22}
          priority
          className="shrink-0"
        />
        <span className="text-sm font-bold uppercase tracking-widest text-text">
          Brotherhood
        </span>
      </Link>

      <HeaderMenu isAdmin={isAdmin} />
    </header>
  );
}
