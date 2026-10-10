"use client";

import { usePathname } from "next/navigation";
import { MobileTopBar } from "@/app/components/MobileTopBar";
import { BackHeader } from "@/app/components/BackHeader";

type Props = {
  isAdmin: boolean;
  rooms: Array<{ slug: string; displayName: string }>;
};

export function AuthedMobileHeader({ isAdmin, rooms }: Props) {
  const pathname = usePathname() ?? "";

  if (pathname === "/goose" || pathname.startsWith("/goose/")) {
    return (
      <BackHeader
        backHref="/home"
        title="Goose"
        isAdmin={isAdmin}
        centered
      />
    );
  }

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

  // Bench match renders its own header (the other party's handle lives in the match row).
  if (/^\/bench\/match\//.test(pathname)) {
    return null;
  }

  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return (
      <BackHeader
        backHref="/home"
        title="Settings"
        isAdmin={isAdmin}
        centered
      />
    );
  }

  return <MobileTopBar isAdmin={isAdmin} />;
}
