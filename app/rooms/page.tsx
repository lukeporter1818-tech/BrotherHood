import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({ orderBy: { displayName: "asc" } });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Locker Room
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Pick a room. Post real or anon — it&apos;s your call.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/rooms/${room.slug}`}
            className="rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
          >
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {room.displayName}
            </h2>
            {room.description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {room.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
