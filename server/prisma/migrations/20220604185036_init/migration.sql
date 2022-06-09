/*
  Warnings:

  - Added the required column `zkCurrencySymbol` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "zkCurrencySymbol" TEXT NOT NULL DEFAULT 'ETH';
