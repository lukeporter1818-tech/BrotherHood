import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/app/bench/profile/ProfileForm";

export const metadata = { title: "Your Bench profile — Brotherhood" };

export default async function BenchProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const existing = await prisma.benchProfile.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          {existing ? "Edit your Bench profile" : "Create your Bench profile"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pick the journey you&apos;re on and where you are with it. Pick whether
          you&apos;re here to listen or to talk.
        </p>
      </div>
      <ProfileForm
        initial={
          existing
            ? {
                journey: existing.journey,
                role: existing.role,
                stageText: existing.stageText,
                bio: existing.bio ?? "",
              }
            : null
        }
      />
    </div>
  );
}
