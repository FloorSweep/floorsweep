import { SignatureLike } from "@ethersproject/bytes";

export type MetadataAttribute = {trait_type: string, value: string}
export interface CreateMetadataParams {
  name: string;
  description: string;
  attributes: string;
  signature: SignatureLike
}
