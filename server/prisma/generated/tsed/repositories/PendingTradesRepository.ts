import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, PendingTrade } from "../client";
import { PendingTradeModel } from "../models";

@Injectable()
export class PendingTradesRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.pendingTrade
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | PendingTrade | PendingTrade[]): T {
    return deserialize<T>(obj, { type: PendingTradeModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.PendingTradeFindUniqueArgs): Promise<PendingTradeModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<PendingTradeModel | null>(obj);
  }

  async findFirst(args: Prisma.PendingTradeFindFirstArgs): Promise<PendingTradeModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<PendingTradeModel | null>(obj);
  }

  async findMany(args?: Prisma.PendingTradeFindManyArgs): Promise<PendingTradeModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<PendingTradeModel[]>(obj);
  }

  async create(args: Prisma.PendingTradeCreateArgs): Promise<PendingTradeModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<PendingTradeModel>(obj);
  }

  async update(args: Prisma.PendingTradeUpdateArgs): Promise<PendingTradeModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<PendingTradeModel>(obj);
  }

  async upsert(args: Prisma.PendingTradeUpsertArgs): Promise<PendingTradeModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<PendingTradeModel>(obj);
  }

  async delete(args: Prisma.PendingTradeDeleteArgs): Promise<PendingTradeModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<PendingTradeModel>(obj);
  }

  async deleteMany(args: Prisma.PendingTradeDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.PendingTradeUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.PendingTradeAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
