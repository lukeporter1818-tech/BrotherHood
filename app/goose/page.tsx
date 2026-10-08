import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { GooseChat } from "@/app/goose/GooseChat";
import type { ClientMessage } from "@/app/goose/actions";

export const metadata = {
  title: "Goose — Brotherhood",
};

export default async function GoosePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { anonHandle: true },
  });
  const currentUserAnonHandle = profile?.anonHandle ?? "?";

  const session = await prisma.wingmanSession.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-[18px] py-6 sm:px-6">
      <GooseChat
        initialMessages={initialMessages}
        currentUserAnonHandle={currentUserAnonHandle}
      />
    </div>
  );
}
