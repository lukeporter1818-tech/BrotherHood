BEGIN;

-- RoomAvailability: user opt-in for being reachable by Goose matching
-- on a specific room's topic. Row presence = opted-in; row deletion = off.
-- No 'available' boolean needed — the row itself is the signal, which keeps
-- the "who's available for room X" query as a tight index scan.

CREATE TABLE "RoomAvailability" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "roomId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RoomAvailability_pkey" PRIMARY KEY ("id")
);

-- One row per (user, room) pair. Enforces the toggle semantics: a user
-- can't opt in to the same room twice.
CREATE UNIQUE INDEX "RoomAvailability_userId_roomId_key"
  ON "RoomAvailability"("userId", "roomId");

-- Primary lookup pattern is "find all users available for room X" —
-- the composite unique index above doesn't help with that (it's ordered
-- by userId first), so a dedicated index on roomId is required.
CREATE INDEX "RoomAvailability_roomId_idx"
  ON "RoomAvailability"("roomId");

ALTER TABLE "RoomAvailability"
  ADD CONSTRAINT "RoomAvailability_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomAvailability"
  ADD CONSTRAINT "RoomAvailability_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "Room"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
