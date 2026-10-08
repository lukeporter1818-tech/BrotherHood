import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/app/components/AppShell";
import { BackHeader } from "@/app/components/BackHeader";

export default async function BenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [dbUser, pendingMatchCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { anonHandle: true, isAdmin: true },
    }),
    prisma.benchMatch.count({
      where: {
        recipientId: user.id,
        status: "PENDING",
      },
    }),
  ]);
  if (!dbUser) redirect("/login");

  // proxy.ts stamps x-pathname on every request's headers. On /bench/match/<id>
  // (bench chat), fetch the match's two parties, enforce membership, and render
  // a back-arrow header titled with the other party's anonHandle. If the match
  // doesn't exist OR the current user isn't a participant, redirect to /bench
  // before any header renders — never confirm the match exists or reveal a
  // handle to a non-participant.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const matchMatch = /^\/bench\/match\/([^/]+)/.exec(pathname);

  let mobileHeader: React.ReactNode | undefined = undefined;
  if (matchMatch) {
    const matchId = matchMatch[1];
    const match = await prisma.benchMatch.findUnique({
      where: { id: matchId },
      select: {
        initiatorId: true,
        recipientId: true,
        initiator: { select: { anonHandle: true } },
        recipient: { select: { anonHandle: true } },
      },
    });
    if (!match) redirect("/bench");
    if (match.initiatorId !== user.id && match.recipientId !== user.id) {
      redirect("/bench");
    }
    const otherHandle =
      match.initiatorId === user.id
        ? match.recipient.anonHandle
        : match.initiator.anonHandle;
    mobileHeader = (
      <BackHeader
        backHref="/bench"
        title={otherHandle}
        isAdmin={dbUser.isAdmin}
        tone="mint"
      />
    );
  }

  return (
    <AppShell
      isAdmin={dbUser.isAdmin}
      anonHandle={dbUser.anonHandle}
      pendingMatchCount={pendingMatchCount}
      mobileHeader={mobileHeader}
    >
      {children}
    </AppShell>
  );
}
