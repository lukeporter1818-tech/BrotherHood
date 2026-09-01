-- Non-destructive rename: preserves all existing rows.
-- Renames table, index, and FK constraint to match the new Brief model name.
ALTER TABLE "Digest" RENAME TO "Brief";
ALTER INDEX "Digest_userId_createdAt_idx" RENAME TO "Brief_userId_createdAt_idx";
ALTER TABLE "Brief" RENAME CONSTRAINT "Digest_userId_fkey" TO "Brief_userId_fkey";
