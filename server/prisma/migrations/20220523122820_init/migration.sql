/*
  Warnings:

  - A unique constraint covering the columns `[txId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sellerAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nft" ADD COLUMN     "imgHeight" INTEGER,
ADD COLUMN     "imgWidth" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "buyerAddress" TEXT,
ADD COLUMN     "sellerAddress" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "txId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_txId_key" ON "Order"("txId");
