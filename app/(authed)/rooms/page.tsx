import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RoomIcon } from "@/app/components/RoomIcons";
import { DelayedPageSkeleton } from "@/app/components/DelayedPageSkeleton";

export default function RoomsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-[18px] pt-0 pb-24 sm:px-6 sm:pb-10">
      <h1 className="text-[28px] font-semibold text-text">
        Rooms
      </h1>
      <p className="-mt-0.5 text-[17px] text-subhead">
        Conversations on what matters.
      </p>

      <Suspense fallback={<DelayedPageSkeleton rows={4} />}>
        <RoomsGrid />
      </Suspense>
    </div>
  );
}

async function RoomsGrid() {
  const rooms = await prisma.room.findMany({
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
  });

  return (
    <div className="mt-[8px] grid gap-[5px] sm:grid-cols-2">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/rooms/${room.slug}`}
          className="flex min-h-[74px] items-center rounded-[14px] border border-border bg-surface pl-2 pr-5 transition-colors hover:border-signal"
        >
          <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[14px] bg-signal/10 text-signal">
            <RoomIcon name={room.displayName} className="h-[30px] w-[30px] stroke-2" />
          </div>
          <div className="ml-[26px] min-w-0 flex-1">
            <h2 className="text-[15px] font-medium text-text">
              {room.displayName}
            </h2>
            {room.description && (
              <p className="mt-0.5 line-clamp-2 max-w-[192px] text-[13.5px] leading-[19px] text-subhead">
                {room.description}
              </p>
            )}
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 8 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-4 h-4 w-2 shrink-0 text-text-muted"
          >
            <path d="M1 1l6 7-6 7" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
