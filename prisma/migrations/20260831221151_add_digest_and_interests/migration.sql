-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interestTopics" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Digest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topics" TEXT[],
    "content" JSONB NOT NULL,
    "model" TEXT NOT NULL,

    CONSTRAINT "Digest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Digest_userId_createdAt_idx" ON "Digest"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Digest" ADD CONSTRAINT "Digest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
