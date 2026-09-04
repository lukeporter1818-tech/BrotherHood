-- Destructive: removes the dual-identity concept entirely.
-- Verified before running: Post has 0 REAL rows, Reply has 0 REAL rows,
-- BenchMessage has 1 REAL row from a seed persona (no user PII).
-- User.realName holds only seed persona names; no real users had it set.

ALTER TABLE "Post" DROP COLUMN "identityUsed";
ALTER TABLE "Reply" DROP COLUMN "identityUsed";
ALTER TABLE "BenchMessage" DROP COLUMN "identityUsed";
ALTER TABLE "User" DROP COLUMN "realName";
DROP TYPE "Identity";
