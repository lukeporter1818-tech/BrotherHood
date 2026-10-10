import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { getAuthorizedMatch } from "@/lib/bench/matching";
import { BackHeader } from "@/app/components/BackHeader";
import { BenchChat } from "@/app/(authed)/bench/match/[id]/BenchChat";
import type { ClientBenchMessage } from "@/app/(authed)/bench/match/[id]/actions";

export const metadata = { title: "Bench conversation — Brotherhood" };

export default async function BenchMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) redirect("/login");

  const match = await getAuthorizedMatch({ matchId: id, userId: user.id });
  if (!match) notFound();

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { anonHandle: true, isAdmin: true },
  });
  if (!currentUser) redirect("/login");

  const isInitiator = match.initiatorId === user.id;
  const otherUser = isInitiator ? match.recipient : match.initiator;

  const mobileHeader = (
    <div className="md:hidden">
      <BackHeader
        backHref="/bench"
        title={otherUser.anonHandle}
        isAdmin={currentUser.isAdmin}
        tone="mint"
      />
    </div>
  );

  if (match.status === "DECLINED" || match.status === "ENDED") {
    return (
      <>
        {mobileHeader}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-8">
          <Link
            href="/bench"
            className="hidden text-xs text-text-muted hover:text-text md:inline-block"
          >
            ← Back to Bench
          </Link>
          <p className="text-sm text-text-muted">
            This conversation is closed.
          </p>
        </div>
      </>
    );
  }

  if (match.status === "PENDING") {
    return (
      <>
        {mobileHeader}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-8">
          <Link
            href="/bench"
            className="hidden text-xs text-text-muted hover:text-text md:inline-block"
          >
            ← Back to Bench
          </Link>
          <p className="text-sm text-text-muted">
            Waiting for the other person to accept. Once accepted, you can message here.
          </p>
        </div>
      </>
    );
  }

  const messagesRaw = await prisma.benchMessage.findMany({
    where: { matchId: id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { anonHandle: true } } },
  });
  const initialMessages: ClientBenchMessage[] = messagesRaw.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    content: m.content,
    senderAnonHandle: m.sender.anonHandle,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <>
      {mobileHeader}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-[18px] pt-0 pb-24 sm:px-6 sm:pt-6 sm:pb-6">
        <div>
          <Link
            href="/bench"
            className="hidden text-xs text-text-muted hover:text-text md:inline-block"
          >
            ← Back to Bench
          </Link>
          <h1 className="mt-2 hidden text-lg font-semibold text-text md:block">
            {otherUser.anonHandle}
          </h1>
        </div>
        <BenchChat
          matchId={id}
          currentUserId={user.id}
          currentUserAnonHandle={currentUser.anonHandle}
          initialMessages={initialMessages}
        />
      </div>
    </>
  );
}
