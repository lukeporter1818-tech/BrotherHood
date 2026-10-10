import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { getDbUser, getRooms } from "@/lib/queries";
import { AppShell } from "@/app/components/AppShell";
import { AuthedMobileHeader } from "@/app/components/AuthedMobileHeader";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [dbUser, pendingMatchCount, rooms] = await Promise.all([
    getDbUser(user.id),
    prisma.benchMatch.count({
      where: {
        recipientId: user.id,
        status: "PENDING",
      },
    }),
    getRooms(),
  ]);
  if (!dbUser) redirect("/login");

  const roomLinks = rooms.map(({ slug, displayName }) => ({ slug, displayName }));

  return (
    <AppShell
      isAdmin={dbUser.isAdmin}
      anonHandle={dbUser.anonHandle}
      pendingMatchCount={pendingMatchCount}
      mobileHeader={
        <AuthedMobileHeader isAdmin={dbUser.isAdmin} rooms={roomLinks} />
      }
    >
      {children}
    </AppShell>
  );
}
