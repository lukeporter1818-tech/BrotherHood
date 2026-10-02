import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({ orderBy: { displayName: "asc" } });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-10 pb-24 sm:pb-10">
      <h1 className="text-2xl font-semibold text-text">
        Locker Room
      </h1>
      <p className="mt-1 text-text-muted">
        Pick a room. Post real or anon — it&apos;s your call.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/rooms/${room.slug}`}
            className="rounded border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h2 className="font-semibold text-text">
              {room.displayName}
            </h2>
            {room.description && (
              <p className="mt-1 text-sm text-text-muted">
                {room.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
