import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/app/components/AppShell";
import { BackHeader } from "@/app/components/BackHeader";

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

  // proxy.ts stamps x-pathname on every request's headers. On /rooms/<slug>
  // (room detail or post detail), fetch the room's displayName and render a
  // back-arrow header. On /rooms (list) or if the header is missing, fall
  // through to AppShell's default MobileTopBar.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const slugMatch = /^\/rooms\/([^/]+)/.exec(pathname);

  let mobileHeader: React.ReactNode | undefined = undefined;
  if (slugMatch) {
    const slug = slugMatch[1];
    const room = await prisma.room.findUnique({
      where: { slug },
      select: { displayName: true },
    });
    if (!room) redirect("/rooms");
    mobileHeader = (
      <BackHeader
        backHref="/rooms"
        title={room.displayName}
        isAdmin={dbUser.isAdmin}
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
