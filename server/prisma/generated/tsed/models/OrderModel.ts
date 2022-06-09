import { Order } from "../client";
import { Integer, Required, Property, Allow } from "@tsed/schema";
import { NftModel } from "./NftModel";

export class OrderModel implements Order {
  @Property(Number)
  @Integer()
  @Required()
  id: number;

  @Property(() => NftModel)
  @Required()
  nft: NftModel;

  @Property(Number)
  @Integer()
  @Required()
  tokenId: number;

  @Property(Number)
  @Integer()
  @Required()
  nonce: number;

  @Property(Number)
  @Integer()
  @Required()
  zkCurrencyId: number;

  @Property(Number)
  @Required()
  price: number;

  @Property(Object)
  @Required()
  zkOrder: any;

  @Property(String)
  @Required()
  status: string;

  @Property(String)
  @Required()
  sellerAddress: string;

  @Property(String)
  @Allow(null)
  buyerAddress: string | null;

  @Property(String)
  @Allow(null)
  txId: string | null;

  @Property(String)
  @Required()
  zkCurrencySymbol: string;
}

