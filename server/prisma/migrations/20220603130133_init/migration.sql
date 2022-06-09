-- CreateEnum
CREATE TYPE "PendingTradeStatus" AS ENUM ('committed', 'verified', 'rejected');

-- CreateTable
CREATE TABLE "PendingTrade" (
    "id" SERIAL NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "txData" JSONB NOT NULL,
    "status" "PendingTradeStatus" NOT NULL,

    CONSTRAINT "PendingTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingTrade_txHash_key" ON "PendingTrade"("txHash");
