import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// One Supabase Auth lookup per request. Layouts and pages that run in the same
// request share this result instead of each making their own network call.
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
