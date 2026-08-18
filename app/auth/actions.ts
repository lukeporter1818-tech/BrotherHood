"use server";

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AuthActionState = { error: string | null };

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/rooms");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const anonHandle = String(formData.get("anonHandle") ?? "").trim();

  if (!anonHandle) return { error: "Anon handle is required." };

  const existing = await prisma.user.findUnique({ where: { anonHandle } });
  if (existing) return { error: "That handle is already taken." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Signup failed — no user returned." };

  await prisma.user.create({
    data: { id: data.user.id, email, anonHandle },
  });

  if (!data.session) {
    // Email confirmation required — no session yet.
    redirect("/login?confirm=1");
  }

  redirect("/rooms");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
