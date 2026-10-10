import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/queries";
import { GooseChat } from "@/app/(authed)/goose/GooseChat";
import type { ClientMessage } from "@/app/(authed)/goose/actions";
import { DelayedPageSkeleton } from "@/app/components/DelayedPageSkeleton";

export const metadata = {
  title: "Goose — Brotherhood",
};

export default function GoosePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-[18px] py-6 sm:px-6">
      <Suspense fallback={<DelayedPageSkeleton rows={5} />}>
        <GooseContent />
      </Suspense>
    </div>
  );
}

async function GooseContent() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [profile, session] = await Promise.all([
    getDbUser(user.id),
    prisma.wingmanSession.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
  ]);
  const currentUserAnonHandle = profile?.anonHandle ?? "?";

  let initialMessages: ClientMessage[] = [];
  if (session) {
    const messages = await prisma.wingmanMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        escalated: true,
        riskLevel: true,
        createdAt: true,
      },
    });
    initialMessages = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      escalated: m.escalated,
      riskLevel: m.riskLevel,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  return (
    <GooseChat
      initialMessages={initialMessages}
      currentUserAnonHandle={currentUserAnonHandle}
    />
  );
}
