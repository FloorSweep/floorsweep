import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, Nft } from "../client";
import { NftModel } from "../models";

@Injectable()
export class NftsRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.nft
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | Nft | Nft[]): T {
    return deserialize<T>(obj, { type: NftModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.NftFindUniqueArgs): Promise<NftModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<NftModel | null>(obj);
  }

  async findFirst(args: Prisma.NftFindFirstArgs): Promise<NftModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<NftModel | null>(obj);
  }

  async findMany(args?: Prisma.NftFindManyArgs): Promise<NftModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<NftModel[]>(obj);
  }

  async create(args: Prisma.NftCreateArgs): Promise<NftModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<NftModel>(obj);
  }

  async update(args: Prisma.NftUpdateArgs): Promise<NftModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<NftModel>(obj);
  }

  async upsert(args: Prisma.NftUpsertArgs): Promise<NftModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<NftModel>(obj);
  }

  async delete(args: Prisma.NftDeleteArgs): Promise<NftModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<NftModel>(obj);
  }

  async deleteMany(args: Prisma.NftDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.NftUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.NftAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
