import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, Order } from "../client";
import { OrderModel } from "../models";

@Injectable()
export class OrdersRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.order
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | Order | Order[]): T {
    return deserialize<T>(obj, { type: OrderModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.OrderFindUniqueArgs): Promise<OrderModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<OrderModel | null>(obj);
  }

  async findFirst(args: Prisma.OrderFindFirstArgs): Promise<OrderModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<OrderModel | null>(obj);
  }

  async findMany(args?: Prisma.OrderFindManyArgs): Promise<OrderModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<OrderModel[]>(obj);
  }

  async create(args: Prisma.OrderCreateArgs): Promise<OrderModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<OrderModel>(obj);
  }

  async update(args: Prisma.OrderUpdateArgs): Promise<OrderModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<OrderModel>(obj);
  }

  async upsert(args: Prisma.OrderUpsertArgs): Promise<OrderModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<OrderModel>(obj);
  }

  async delete(args: Prisma.OrderDeleteArgs): Promise<OrderModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<OrderModel>(obj);
  }

  async deleteMany(args: Prisma.OrderDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.OrderUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.OrderAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
