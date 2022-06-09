/*
  Warnings:

  - You are about to drop the column `website_url` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "website_url",
ADD COLUMN     "websiteUrl" TEXT;
