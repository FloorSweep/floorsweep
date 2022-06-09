import { Account } from "../client";
import { Integer, Required, Property, Allow, Email, Description, Format } from "@tsed/schema";

export class AccountModel implements Account {
  @Property(Number)
  @Integer()
  @Required()
  id: number;

  @Property(String)
  @Allow(null)
  @Email()
  @Description("User email. This email must be unique!")
  email: string | null;

  @Property(String)
  @Allow(null)
  displayName: string | null;

  @Property(String)
  @Allow(null)
  description: string | null;

  @Property(String)
  @Allow(null)
  websiteUrl: string | null;

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

  @Property(Date)
  @Format("date-time")
  @Allow(null)
  lastSyncedAt: Date | null;
}

