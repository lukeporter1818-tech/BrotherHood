import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/app/components/AppShell";
import { BackHeader } from "@/app/components/BackHeader";

export default async function SettingsLayout({
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
      mobileHeader={
        <BackHeader
          backHref="/home"
          title="Settings"
          isAdmin={dbUser.isAdmin}
          centered
        />
      }
    >
      {children}
    </AppShell>
  );
}
