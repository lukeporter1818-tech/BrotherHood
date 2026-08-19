import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import { IdentityProvider } from "@/app/components/IdentityProvider";

export default async function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { realName: true, anonHandle: true, isAdmin: true },
  });

  if (!dbUser) redirect("/login");

  return (
    <IdentityProvider realName={dbUser.realName} anonHandle={dbUser.anonHandle}>
      <div className="flex min-h-full flex-1 flex-col">
        <Header isAdmin={dbUser.isAdmin} />
        <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
          {children}
        </main>
      </div>
    </IdentityProvider>
  );
}
