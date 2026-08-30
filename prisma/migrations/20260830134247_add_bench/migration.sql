-- CreateEnum
CREATE TYPE "BenchJourney" AS ENUM ('SOBRIETY', 'DIVORCE', 'GRIEF', 'FATHERHOOD', 'MENTAL_HEALTH', 'CAREER_CHANGE', 'OTHER');

-- CreateEnum
CREATE TYPE "BenchRole" AS ENUM ('MENTOR', 'SEEKER');

-- CreateEnum
CREATE TYPE "BenchMatchStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED', 'ENDED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hoursListened" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BenchProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journey" "BenchJourney" NOT NULL,
    "stageText" TEXT NOT NULL,
    "role" "BenchRole" NOT NULL,
    "bio" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenchProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchMatch" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "seekerProfileId" TEXT NOT NULL,
    "status" "BenchMatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "BenchMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchMessage" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "identityUsed" "Identity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenchMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BenchProfile_userId_key" ON "BenchProfile"("userId");

-- CreateIndex
CREATE INDEX "BenchProfile_journey_role_active_idx" ON "BenchProfile"("journey", "role", "active");

-- CreateIndex
CREATE INDEX "BenchMatch_mentorProfileId_status_idx" ON "BenchMatch"("mentorProfileId", "status");

-- CreateIndex
CREATE INDEX "BenchMatch_seekerProfileId_status_idx" ON "BenchMatch"("seekerProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BenchMatch_mentorProfileId_seekerProfileId_key" ON "BenchMatch"("mentorProfileId", "seekerProfileId");

-- CreateIndex
CREATE INDEX "BenchMessage_matchId_createdAt_idx" ON "BenchMessage"("matchId", "createdAt");

-- AddForeignKey
ALTER TABLE "BenchProfile" ADD CONSTRAINT "BenchProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchMatch" ADD CONSTRAINT "BenchMatch_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "BenchProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchMatch" ADD CONSTRAINT "BenchMatch_seekerProfileId_fkey" FOREIGN KEY ("seekerProfileId") REFERENCES "BenchProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchMessage" ADD CONSTRAINT "BenchMessage_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "BenchMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchMessage" ADD CONSTRAINT "BenchMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
