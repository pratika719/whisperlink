/*
  Warnings:

  - Added the required column `updatedAt` to the `AIUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_receiverId_isDeleted_createdAt_idx";

-- DropIndex
DROP INDEX "User_isPublic_isVerified_idx";

-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- DropIndex
DROP INDEX "VerificationToken_userId_type_idx";

-- AlterTable
ALTER TABLE "AIUsage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "lastUsedAt" DROP NOT NULL,
ALTER COLUMN "lastUsedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "AIUsage_userId_idx" ON "AIUsage"("userId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "Message"("isRead");

-- CreateIndex
CREATE INDEX "Message_isArchived_idx" ON "Message"("isArchived");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_idx" ON "VerificationToken"("userId");

-- CreateIndex
CREATE INDEX "VerificationToken_token_idx" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_expiresAt_idx" ON "VerificationToken"("expiresAt");
