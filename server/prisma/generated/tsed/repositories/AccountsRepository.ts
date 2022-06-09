import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, Account } from "../client";
import { AccountModel } from "../models";

@Injectable()
export class AccountsRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.account
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | Account | Account[]): T {
    return deserialize<T>(obj, { type: AccountModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.AccountFindUniqueArgs): Promise<AccountModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<AccountModel | null>(obj);
  }

  async findFirst(args: Prisma.AccountFindFirstArgs): Promise<AccountModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<AccountModel | null>(obj);
  }

  async findMany(args?: Prisma.AccountFindManyArgs): Promise<AccountModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<AccountModel[]>(obj);
  }

  async create(args: Prisma.AccountCreateArgs): Promise<AccountModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<AccountModel>(obj);
  }

  async update(args: Prisma.AccountUpdateArgs): Promise<AccountModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<AccountModel>(obj);
  }

  async upsert(args: Prisma.AccountUpsertArgs): Promise<AccountModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<AccountModel>(obj);
  }

  async delete(args: Prisma.AccountDeleteArgs): Promise<AccountModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<AccountModel>(obj);
  }

  async deleteMany(args: Prisma.AccountDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.AccountUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.AccountAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
