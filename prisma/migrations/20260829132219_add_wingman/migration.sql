-- CreateEnum
CREATE TYPE "WingmanRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NONE', 'ELEVATED', 'CRISIS');

-- CreateTable
CREATE TABLE "WingmanSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WingmanSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WingmanMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "WingmanRole" NOT NULL,
    "content" TEXT NOT NULL,
    "riskLevel" "RiskLevel",
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WingmanMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WingmanSession_userId_updatedAt_idx" ON "WingmanSession"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "WingmanMessage_sessionId_createdAt_idx" ON "WingmanMessage"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "WingmanSession" ADD CONSTRAINT "WingmanSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WingmanMessage" ADD CONSTRAINT "WingmanMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WingmanSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
