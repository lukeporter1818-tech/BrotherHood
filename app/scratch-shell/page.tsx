import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SideNav } from "@/app/components/SideNav";
import { TopBar } from "@/app/components/TopBar";

export const metadata = { title: "Scratch shell — Brotherhood" };

export default async function ScratchShellPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { anonHandle: true, isAdmin: true },
  });
  if (!dbUser) redirect("/login");

  return (
    <div className="flex min-h-screen gap-4 p-4 md:gap-6 md:p-6">
      <SideNav isAdmin={dbUser.isAdmin} previewActive="/home" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <TopBar anonHandle={dbUser.anonHandle} />
        <main className="flex-1 p-6">
          <div className="rounded-2xl border border-border bg-elevated p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">
              Preview
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Scratch shell: SideNav on the left (md+), TopBar across the top.
              This page is a sandbox — real layouts are not touched yet.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
