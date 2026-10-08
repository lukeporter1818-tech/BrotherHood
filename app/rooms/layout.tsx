import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/app/components/AppShell";
import { RoomsMobileHeader } from "@/app/components/RoomsMobileHeader";

export default async function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [dbUser, pendingMatchCount, rooms] = await Promise.all([
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
    prisma.room.findMany({
      select: { slug: true, displayName: true },
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    }),
  ]);
  if (!dbUser) redirect("/login");

  return (
    <AppShell
      isAdmin={dbUser.isAdmin}
      anonHandle={dbUser.anonHandle}
      pendingMatchCount={pendingMatchCount}
      mobileHeader={
        <RoomsMobileHeader isAdmin={dbUser.isAdmin} rooms={rooms} />
      }
    >
      {children}
    </AppShell>
  );
}
