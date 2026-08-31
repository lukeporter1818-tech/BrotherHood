import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({ orderBy: { displayName: "asc" } });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
        Locker Room
      </h1>
      <p className="mt-1 text-navy-700 dark:text-parchment-200">
        Pick a room. Post real or anon — it&apos;s your call.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/rooms/${room.slug}`}
            className="rounded border border-parchment-200 bg-parchment-50 p-5 transition-colors hover:border-navy-700 dark:border-navy-800 dark:bg-navy-900 dark:hover:border-navy-600"
          >
            <h2 className="font-semibold text-navy-950 dark:text-parchment-50">
              {room.displayName}
            </h2>
            {room.description && (
              <p className="mt-1 text-sm text-navy-700 dark:text-parchment-200">
                {room.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
