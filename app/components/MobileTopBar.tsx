import Image from "next/image";
import Link from "next/link";
import { HeaderMenu } from "@/app/components/HeaderMenu";

type Props = { isAdmin: boolean };

export function MobileTopBar({ isAdmin }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3">
      <Link href="/home" className="flex items-center gap-[14px]">
        <Image
          src="/icons/bh-glyph.png"
          alt=""
          width={36}
          height={43}
          priority
          className="h-[43px] w-[36px] shrink-0"
        />
        <span className="text-[14px] font-medium uppercase tracking-[0.3em] text-signal-bright">
          Brotherhood
        </span>
      </Link>

      <HeaderMenu isAdmin={isAdmin} />
    </header>
  );
}
