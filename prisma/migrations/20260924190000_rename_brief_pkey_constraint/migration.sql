-- Cleanup: rename the primary key constraint left over from the
-- 20260831235900_rename_digest_to_brief migration, which renamed the
-- table, index, and FK constraint but missed the pkey.
ALTER TABLE "Brief" RENAME CONSTRAINT "Digest_pkey" TO "Brief_pkey";
