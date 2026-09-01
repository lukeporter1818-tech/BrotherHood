-- Enable row-level security on every public table.
--
-- Prisma connects as the `postgres` role which has BYPASSRLS, so app
-- queries are unaffected. `service_role` also has BYPASSRLS so admin
-- flows continue to work. `anon` and `authenticated` — the roles used
-- by the public PostgREST API with the Supabase anon key — do NOT
-- have BYPASSRLS, so with no permissive policies they get default-
-- deny on every table.
--
-- The app does not use supabase-js for data queries (only auth), so
-- no policies are needed today. If a future feature ever queries a
-- table through supabase-js, add a deliberate policy for that table.

ALTER TABLE public."BenchMatch"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BenchMessage"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BenchProfile"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Brief"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DailyCheckIn"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Post"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Reply"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Report"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Room"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Squad"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SquadMembership"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WingmanMessage"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WingmanSession"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
