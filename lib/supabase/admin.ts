import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for privileged auth operations (e.g. deleting an auth
// user from a server action). Never import this in a client component.
//
// Uses the direct @supabase/supabase-js client — NOT the SSR client — so the
// Authorization header stays set to the service role key instead of being
// overridden by the caller's user session cookie.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
