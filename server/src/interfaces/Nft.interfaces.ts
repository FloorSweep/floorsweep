import {NFT} from "zksync/build/types";
import {NftStatus} from "../../prisma/generated/tsed";
export interface NFTWithStatus extends NFT {
    status: NftStatus;
}

// TODO: shall we share these interfaces with the front end? these are dups
export type Attributes = {trait_type: string, value: string}

export interface Metadata {
    description: string;
    external_url?: string;
    image: string;
    name: string;
    attributes: Attributes[]
}

export interface NftQueryParams {

}
