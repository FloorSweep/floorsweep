import {Order as ZKOrder, NFT as ZKNFT, TransactionData, ApiTransaction} from "zksync/src/types";

export enum NFTStatus {
    committed = 'committed',
    verified = 'verified',
    swapping = 'swapping'
}

export type Attribute = { trait_type: string, value: string }

export interface Metadata {
    description: string;
    external_url?: string;
    image: string;
    name: string;
    attributes: Attribute[]
    imageCID: string;
}

export enum OrderStatus {
    new = 'new',
    completed = 'completed',
}

export interface Order {
    id: number;
    tokenId: number;
    nonce: number;
    zkCurrencyId: number;
    zkCurrencySymbol: string;
    price: number;
    zkOrder: ZKOrder;
    status: OrderStatus;
    sellerAddress: string;
    buyerAddress?: string;
    txId?: string;
}

interface ZkNFTWithStatus extends ZKNFT {
    status: NFTStatus
}

export interface NFT {
    id: number;
    address: string;
    createdAt: string;
    updatedAt: string;
    tokenId: number;
    metadata: Metadata;
    ownerAddress: string | null;
    creatorAddress: string;
    zkContentHash: string;
    imageCID: string;
    metadataCID: string;
    imageUrl: string;
    metadataUrl: string;
    status: NFTStatus,
    name: string;
    nftObject: ZkNFTWithStatus;
    order: Order[];
    isForSale: boolean;
    imgWidth?: number;
    imgHeight?: number;
    isVisible: boolean;
    lastValidatedAt: string;
    salePrice?: number;
    saleCurrency?: string
}

export interface Account {
    id: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    email?: string;
    displayName?: string;
    description?: string;
    websiteUrl?: string;
    lastSyncedAt?: string;
}


export interface NftHistory extends Pick<TransactionData, 'type'> {
    from: string;
    to: string;
    txId: string;
    tx: ApiTransaction;
}