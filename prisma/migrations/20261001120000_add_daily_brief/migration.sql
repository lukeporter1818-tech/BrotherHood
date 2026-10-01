-- CreateTable
CREATE TABLE "DailyBrief" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "headline" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "topicSeed" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex — unique on date is the hard idempotency guarantee.
-- Even if two cron fires race past the application-level pre-check,
-- the second INSERT trips P2002 and the route treats that as success.
CREATE UNIQUE INDEX "DailyBrief_date_key" ON "DailyBrief"("date");

-- Enable row-level security to match every other public table (see
-- 20260901160000_enable_rls_public_tables and
-- 20260929120000_enable_rls_room_availability). DailyBrief is written
-- only by the cron route and read only server-side via Prisma on /home
-- — both as the postgres role, which has BYPASSRLS. anon /
-- authenticated get default-deny with no permissive policies.
ALTER TABLE public."DailyBrief" ENABLE ROW LEVEL SECURITY;
