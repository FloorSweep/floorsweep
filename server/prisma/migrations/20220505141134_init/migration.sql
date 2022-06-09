-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nft" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenId" INTEGER NOT NULL,
    "imageCID" TEXT NOT NULL,
    "metadataCID" TEXT NOT NULL,
    "zkContentHash" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "ownerAddress" TEXT,
    "metadata" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL,
    "nftObject" TEXT NOT NULL,
    "lastValidatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "nftTokenId" INTEGER NOT NULL,
    "nonce" INTEGER NOT NULL,
    "zkCurrencyId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "zkOrder" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_displayName_key" ON "Account"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Account_address_key" ON "Account"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Nft_address_key" ON "Nft"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Nft_tokenId_key" ON "Nft"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_nftTokenId_key" ON "Order"("nftTokenId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_nftTokenId_fkey" FOREIGN KEY ("nftTokenId") REFERENCES "Nft"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;
