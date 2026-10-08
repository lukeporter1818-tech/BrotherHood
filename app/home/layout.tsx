import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/app/components/AppShell";

export default async function HomeLayout({
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

  return (
    <AppShell
      isAdmin={dbUser.isAdmin}
      anonHandle={dbUser.anonHandle}
      pendingMatchCount={pendingMatchCount}
    >
      {children}
    </AppShell>
  );
}
