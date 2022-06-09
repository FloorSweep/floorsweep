/*
  Warnings:

  - You are about to drop the column `nftTokenId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `tokenId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_nftTokenId_fkey";

-- DropIndex
DROP INDEX "Order_nftTokenId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "nftTokenId",
ADD COLUMN     "tokenId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Nft"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;
