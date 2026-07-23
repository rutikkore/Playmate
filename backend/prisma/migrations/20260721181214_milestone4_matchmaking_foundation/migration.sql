/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MatchParticipant` table. All the data in the column will be lost.
  - You are about to drop the `HostedMatch` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[matchId,userId]` on the table `MatchParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matchId` to the `MatchParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MatchParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MIXED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('HOST', 'PLAYER');

-- CreateEnum
CREATE TYPE "MatchVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "MatchParticipant" DROP COLUMN "createdAt",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matchId" TEXT NOT NULL,
ADD COLUMN     "role" "ParticipantRole" NOT NULL DEFAULT 'PLAYER',
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "HostedMatch";

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "description" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'OPEN',
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'MIXED',
    "maxPlayers" INTEGER NOT NULL,
    "participantCount" INTEGER NOT NULL DEFAULT 1,
    "visibility" "MatchVisibility" NOT NULL DEFAULT 'PUBLIC',
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_bookingId_key" ON "Match"("bookingId");

-- CreateIndex
CREATE INDEX "Match_hostId_idx" ON "Match"("hostId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_sportId_idx" ON "Match"("sportId");

-- CreateIndex
CREATE INDEX "Match_visibility_idx" ON "Match"("visibility");

-- CreateIndex
CREATE INDEX "Match_status_visibility_idx" ON "Match"("status", "visibility");

-- CreateIndex
CREATE INDEX "MatchParticipant_matchId_idx" ON "MatchParticipant"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_matchId_userId_key" ON "MatchParticipant"("matchId", "userId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
