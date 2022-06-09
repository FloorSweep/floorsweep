/*
  Warnings:

  - The `metadata` column on the `Nft` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `name` to the `Nft` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Nft` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `nftObject` on the `Nft` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `zkOrder` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NftStatus" AS ENUM ('committed', 'verified');

-- AlterTable
ALTER TABLE "Nft" ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB,
DROP COLUMN "status",
ADD COLUMN     "status" "NftStatus" NOT NULL,
DROP COLUMN "nftObject",
ADD COLUMN     "nftObject" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "zkOrder",
ADD COLUMN     "zkOrder" JSONB NOT NULL;
