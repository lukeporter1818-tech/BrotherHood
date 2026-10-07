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
  const match = /^\/rooms\/([^/]+)/.exec(pathname);
  if (match) {
    const room = rooms.find((r) => r.slug === match[1]);
    if (room) {
      return (
        <BackHeader
          backHref="/rooms"
          title={room.displayName}
          isAdmin={isAdmin}
        />
      );
    }
  }
  return <MobileTopBar isAdmin={isAdmin} />;
}
