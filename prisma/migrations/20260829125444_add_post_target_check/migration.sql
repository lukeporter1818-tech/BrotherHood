-- Enforce that every Post targets exactly one of (roomId, squadId).
-- The application layer (app/rooms/actions.ts::createPost) already validates
-- this, but a DB-level CHECK is the last line of defense against future code
-- paths that bypass the shared entry point.

-- Fail loudly if any existing row would violate the constraint. On a clean
-- pre-launch DB this should always pass; leaving the guard in makes the
-- migration safe to re-run against any environment.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Post"
    WHERE ("roomId" IS NOT NULL) = ("squadId" IS NOT NULL)
  ) THEN
    RAISE EXCEPTION 'Cannot add Post_target_exactly_one_chk: existing Post rows have both or neither of (roomId, squadId) set.';
  END IF;
END $$;

ALTER TABLE "Post"
  ADD CONSTRAINT "Post_target_exactly_one_chk"
  CHECK (("roomId" IS NOT NULL) <> ("squadId" IS NOT NULL));
