import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";

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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { realName: true, anonHandle: true },
  });

  if (!dbUser) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header realName={dbUser.realName} anonHandle={dbUser.anonHandle} />
      <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
        {children}
      </main>
    </div>
  );
}
