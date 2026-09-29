-- Enable row-level security on RoomAvailability.
--
-- This table was added on 2026-09-27 via a raw db execute migration
-- after the original RLS-enable pass (20260901160000) covered every
-- table that existed at that time, so it shipped with RLS off and was
-- flagged by Supabase security advisor as publicly accessible.
--
-- Same guarantees as the original pass: Prisma connects as `postgres`
-- (BYPASSRLS), `service_role` also bypasses. `anon`/`authenticated` —
-- the roles behind the PostgREST anon key — get default-deny with no
-- permissive policies, which is what we want since RoomAvailability
-- is only touched server-side via Prisma.

ALTER TABLE public."RoomAvailability" ENABLE ROW LEVEL SECURITY;
