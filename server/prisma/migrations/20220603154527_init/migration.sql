/*
  Warnings:

  - The values [verified] on the enum `PendingTradeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PendingTradeStatus_new" AS ENUM ('queued', 'committed', 'finalized', 'rejected');
ALTER TABLE "PendingTrade" ALTER COLUMN "status" TYPE "PendingTradeStatus_new" USING ("status"::text::"PendingTradeStatus_new");
ALTER TYPE "PendingTradeStatus" RENAME TO "PendingTradeStatus_old";
ALTER TYPE "PendingTradeStatus_new" RENAME TO "PendingTradeStatus";
DROP TYPE "PendingTradeStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "PendingTrade" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
