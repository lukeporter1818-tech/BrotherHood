import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await prisma.room.findUnique({ where: { slug } });

  if (!room) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/rooms"
        className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← All rooms
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        {room.displayName}
      </h1>
      {room.description && (
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{room.description}</p>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
        Posts land here in Sprint 2.
      </div>
    </div>
  );
}
