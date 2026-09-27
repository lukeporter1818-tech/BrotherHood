BEGIN;

-- unified_rooms: merge Rooms + Squads + Bench into one structure
--
-- Order of operations:
--   1. Migrate BenchMatch FKs (extract userId from BenchProfile rows)
--      → must happen BEFORE BenchProfile is dropped
--   2. Wipe dev post content (Reports → Replies → Posts)
--      → must happen BEFORE making Post.roomId NOT NULL
--      → must happen BEFORE re-seeding Room rows
--   3. Drop Post.squadId column
--      → removes Post_squadId_fkey, which lets Squad be dropped next
--   4. Drop SquadMembership, then Squad
--   5. Repair Post.roomId FK, make it NOT NULL
--   6. Drop BenchProfile
--   7. Drop BenchJourney and BenchRole enums
--   8. Drop hoursListened from User
--   9. Add sortOrder to Room
--  10. Re-seed Room with 8 canonical topic rooms


-- ─────────────────────────────────────────────────────────────
-- 1. Migrate BenchMatch to User-direct FKs
--    Add new columns as nullable, populate from BenchProfile.userId,
--    then enforce NOT NULL — all before BenchProfile is dropped.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "BenchMatch" ADD COLUMN "initiatorId" TEXT;
ALTER TABLE "BenchMatch" ADD COLUMN "recipientId" TEXT;
ALTER TABLE "BenchMatch" ADD COLUMN "context"     TEXT;

UPDATE "BenchMatch" bm
SET
  "initiatorId" = seeker."userId",
  "recipientId" = mentor."userId"
FROM "BenchProfile" seeker,
     "BenchProfile" mentor
WHERE bm."seekerProfileId" = seeker.id
  AND bm."mentorProfileId" = mentor.id;

ALTER TABLE "BenchMatch" ALTER COLUMN "initiatorId" SET NOT NULL;
ALTER TABLE "BenchMatch" ALTER COLUMN "recipientId" SET NOT NULL;

ALTER TABLE "BenchMatch" DROP CONSTRAINT "BenchMatch_mentorProfileId_fkey";
ALTER TABLE "BenchMatch" DROP CONSTRAINT "BenchMatch_seekerProfileId_fkey";
DROP INDEX "BenchMatch_mentorProfileId_status_idx";
DROP INDEX "BenchMatch_seekerProfileId_status_idx";
DROP INDEX "BenchMatch_mentorProfileId_seekerProfileId_key";
ALTER TABLE "BenchMatch" DROP COLUMN "mentorProfileId";
ALTER TABLE "BenchMatch" DROP COLUMN "seekerProfileId";

ALTER TABLE "BenchMatch" ADD CONSTRAINT "BenchMatch_initiatorId_recipientId_key"
  UNIQUE ("initiatorId", "recipientId");
ALTER TABLE "BenchMatch" ADD CONSTRAINT "BenchMatch_initiatorId_fkey"
  FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BenchMatch" ADD CONSTRAINT "BenchMatch_recipientId_fkey"
  FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "BenchMatch_initiatorId_status_idx" ON "BenchMatch"("initiatorId", "status");
CREATE INDEX "BenchMatch_recipientId_status_idx" ON "BenchMatch"("recipientId", "status");


-- ─────────────────────────────────────────────────────────────
-- 2. Wipe dev post content
--    Reports → Replies → Posts (FK dependency order).
--    All dev data; rooms are being replaced so all existing posts
--    are invalid regardless.
-- ─────────────────────────────────────────────────────────────

DELETE FROM "Report";
DELETE FROM "Reply";
DELETE FROM "Post";


-- ─────────────────────────────────────────────────────────────
-- 3. Drop Post.squadId
--    Removes Post_squadId_fkey, which lets Squad be dropped next.
-- ─────────────────────────────────────────────────────────────

-- Composite index must be dropped explicitly before dropping its column.
DROP INDEX "Post_squadId_createdAt_idx";
-- DROP COLUMN cascades to Post_squadId_fkey automatically.
ALTER TABLE "Post" DROP COLUMN "squadId";


-- ─────────────────────────────────────────────────────────────
-- 4. Drop SquadMembership, then Squad
--    Squad has no remaining dependents after step 3.
-- ─────────────────────────────────────────────────────────────

DROP TABLE "SquadMembership";
DROP TABLE "Squad";


-- ─────────────────────────────────────────────────────────────
-- 5. Repair Post.roomId FK, make it NOT NULL
--    Replace the old SET NULL FK with RESTRICT — roomId is now required.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "Post" DROP CONSTRAINT "Post_roomId_fkey";
ALTER TABLE "Post" ALTER COLUMN "roomId" SET NOT NULL;
ALTER TABLE "Post" ADD CONSTRAINT "Post_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ─────────────────────────────────────────────────────────────
-- 6. Drop BenchProfile
--    Safe now — BenchMatch no longer holds FK references to it.
-- ─────────────────────────────────────────────────────────────

DROP TABLE "BenchProfile";


-- ─────────────────────────────────────────────────────────────
-- 7. Drop BenchJourney and BenchRole enums
--    Safe now — BenchProfile (their only consumer) is gone.
-- ─────────────────────────────────────────────────────────────

DROP TYPE "BenchJourney";
DROP TYPE "BenchRole";


-- ─────────────────────────────────────────────────────────────
-- 8. Drop hoursListened from User
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "User" DROP COLUMN "hoursListened";


-- ─────────────────────────────────────────────────────────────
-- 9. Add sortOrder to Room
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "Room" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;


-- ─────────────────────────────────────────────────────────────
-- 10. Re-seed Room with 8 canonical topic rooms
--     All existing Room rows are cleared first (their posts are
--     already gone from step 2).
-- ─────────────────────────────────────────────────────────────

DELETE FROM "Room";

INSERT INTO "Room" ("id", "slug", "displayName", "description", "sortOrder") VALUES
  (gen_random_uuid()::text, 'sobriety',         'Sobriety',                     'Recovery, staying sober, and the work it takes.',      1),
  (gen_random_uuid()::text, 'fatherhood',       'Fatherhood',                   'Being a dad — the real parts.',                        2),
  (gen_random_uuid()::text, 'fitness',          'Fitness',                      'Training, health, and showing up for your body.',      3),
  (gen_random_uuid()::text, 'entrepreneurship', 'Entrepreneurship & Career',    'Building, grinding, and figuring out your work life.', 4),
  (gen_random_uuid()::text, 'relationships',    'Relationships & Marriage',      'Partnerships, divorce, and everything between.',       5),
  (gen_random_uuid()::text, 'grief',            'Grief & Loss',                 'Loss in all its forms.',                               6),
  (gen_random_uuid()::text, 'faith',            'Faith',                        'Belief, doubt, and the spiritual life.',               7),
  (gen_random_uuid()::text, 'mental-health',    'Mental Health / Just Talking',  'No agenda. Just men talking.',                        8);

COMMIT;
