import { Nft } from "../client";
import { Integer, Required, Property, Format, Allow, CollectionOf, Enum } from "@tsed/schema";
import { OrderModel } from "./OrderModel";
import { NftStatus } from "../enums";

export class NftModel implements Nft {
  @Property(Number)
  @Integer()
  @Required()
  id: number;

  @Property(String)
  @Required()
  address: string;

  @Property(Date)
  @Format("date-time")
  @Required()
  createdAt: Date;

  @Property(Date)
  @Format("date-time")
  @Required()
  updatedAt: Date;

  @Property(Number)
  @Integer()
  @Required()
  tokenId: number;

  @Property(String)
  @Required()
  imageCID: string;

  @Property(String)
  @Required()
  metadataCID: string;

  @Property(String)
  @Required()
  zkContentHash: string;

  @Property(String)
  @Required()
  creatorAddress: string;

  @Property(String)
  @Allow(null)
  ownerAddress: string | null;

  @Property(Object)
  @Allow(null)
  metadata: any | null;

  @CollectionOf(() => OrderModel)
  @Required()
  order: OrderModel[];

  @Property(Boolean)
  @Required()
  isVisible: boolean;

  @Required()
  @Enum(NftStatus)
  status: NftStatus;

  @Property(Object)
  @Required()
  nftObject: any;

  @Property(Date)
  @Format("date-time")
  @Required()
  lastValidatedAt: Date;

  @Property(String)
  @Required()
  name: string;

  @Property(Number)
  @Integer()
  @Allow(null)
  imgWidth: number | null;

  @Property(Number)
  @Integer()
  @Allow(null)
  imgHeight: number | null;
}

