import { PendingTrade } from "../client";
import { Integer, Required, Property, Description, Enum, Format } from "@tsed/schema";
import { PendingTradeStatus } from "../enums";

export class PendingTradeModel implements PendingTrade {
  @Property(Number)
  @Integer()
  @Required()
  id: number;

  @Property(String)
  @Required()
  fromAddress: string;

  @Property(String)
  @Required()
  toAddress: string;

  @Property(Number)
  @Integer()
  @Required()
  tokenId: number;

  @Property(String)
  @Required()
  txHash: string;

  @Property(Object)
  @Required()
  @Description("save data for auditing etc, mostly used as cache, but for processing data should always be queried from zkSync")
  txData: any;

  @Required()
  @Enum(PendingTradeStatus)
  status: PendingTradeStatus;

  @Property(Date)
  @Format("date-time")
  @Required()
  createdAt: Date;
}

