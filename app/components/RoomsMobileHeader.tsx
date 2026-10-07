"use client";

import { usePathname } from "next/navigation";
import { MobileTopBar } from "@/app/components/MobileTopBar";
import { BackHeader } from "@/app/components/BackHeader";

type Props = {
  isAdmin: boolean;
  rooms: Array<{ slug: string; displayName: string }>;
};

export function RoomsMobileHeader({ isAdmin, rooms }: Props) {
  const pathname = usePathname() ?? "";
  const postMatch = /^\/rooms\/([^/]+)\/([^/]+)/.exec(pathname);
  if (postMatch) {
    const room = rooms.find((r) => r.slug === postMatch[1]);
    if (room) {
      return (
        <BackHeader
          backHref={`/rooms/${room.slug}`}
          title={room.displayName}
          isAdmin={isAdmin}
          tone="mint"
        />
      );
    }
  }
  const roomMatch = /^\/rooms\/([^/]+)/.exec(pathname);
  if (roomMatch) {
    const room = rooms.find((r) => r.slug === roomMatch[1]);
    if (room) {
      return (
        <BackHeader
          backHref="/rooms"
          title="All rooms"
          isAdmin={isAdmin}
          tone="mint"
        />
      );
    }
  }
  return <MobileTopBar isAdmin={isAdmin} />;
}
