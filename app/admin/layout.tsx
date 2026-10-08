import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isAdmin: true },
  });

  if (!dbUser?.isAdmin) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <p className="text-slate-500">403 — Not authorized.</p>
      </div>
    );
  }

  return <>{children}</>;
}
