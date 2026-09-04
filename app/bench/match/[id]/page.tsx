import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedMatch } from "@/lib/bench/matching";
import { BenchChat } from "@/app/bench/match/[id]/BenchChat";
import type { ClientBenchMessage } from "@/app/bench/match/[id]/actions";

export const metadata = { title: "Bench conversation — Brotherhood" };

export default async function BenchMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const match = await getAuthorizedMatch({ matchId: id, userId: user.id });
  if (!match) notFound();

  if (match.status === "DECLINED" || match.status === "ENDED") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-8">
        <Link
          href="/bench"
          className="text-xs text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
        >
          ← Back to Bench
        </Link>
        <p className="text-sm text-navy-700 dark:text-parchment-200">
          This conversation is closed.
        </p>
      </div>
    );
  }

  if (match.status === "PENDING") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-8">
        <Link
          href="/bench"
          className="text-xs text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
        >
          ← Back to Bench
        </Link>
        <p className="text-sm text-navy-700 dark:text-parchment-200">
          Waiting on the mentor to accept. Once accepted, you can message here.
        </p>
      </div>
    );
  }

  const messagesRaw = await prisma.benchMessage.findMany({
    where: { matchId: id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { realName: true, anonHandle: true } } },
  });
  const initialMessages: ClientBenchMessage[] = messagesRaw.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    content: m.content,
    identityUsed: m.identityUsed,
    senderRealName: m.sender.realName,
    senderAnonHandle: m.sender.anonHandle,
    createdAt: m.createdAt.toISOString(),
  }));

  const isMentor = match.mentorProfile.userId === user.id;
  const otherProfile = isMentor ? match.seekerProfile : match.mentorProfile;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 pt-6 pb-24 sm:pb-6">
      <div>
        <Link
          href="/bench"
          className="text-xs text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
        >
          ← Back to Bench
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-navy-950 dark:text-parchment-50">
          {otherProfile.user.anonHandle}
        </h1>
        <p className="text-xs text-slate-500">{otherProfile.stageText}</p>
      </div>
      <BenchChat
        matchId={id}
        currentUserId={user.id}
        initialMessages={initialMessages}
      />
    </div>
  );
}
