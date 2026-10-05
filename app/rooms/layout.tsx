import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/app/components/AppShell";

export default async function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
