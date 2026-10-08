"use client";

import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { ProfileAvatar } from "@/app/components/ProfileAvatar";

export function TopBar({
  anonHandle,
  isAdmin = false,
}: {
  anonHandle: string;
  isAdmin?: boolean;
}) {
  return (
    <header className="flex items-stretch justify-between gap-4 border-b border-border bg-surface px-4 md:px-6">
      <Link href="/home" className="flex items-center gap-2 py-3">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={24}
          height={24}
          priority
          className="shrink-0"
        />
        <span className="text-sm font-bold uppercase tracking-widest text-text">
          Brotherhood
        </span>
      </Link>

      <div className="flex items-center gap-3 py-3">
        {isAdmin && (
          <Link
            href="/admin/reports"
            className="text-sm text-text-muted transition-colors duration-150 hover:text-text"
          >
            Admin
          </Link>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-text-muted transition-colors duration-150 hover:text-text"
          >
            Log out
          </button>
        </form>
        <ProfileAvatar anonHandle={anonHandle} />
      </div>
    </header>
  );
}
