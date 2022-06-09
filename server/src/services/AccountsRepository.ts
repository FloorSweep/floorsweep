import {Inject, Injectable} from "@tsed/di";
import {AccountModel, AccountsRepository as BaseRepository} from "../../prisma/generated/tsed";
import {ZZApp} from "./ZZApp";
import {UpdateAccountParams} from "../interfaces/generated";
import {isValidEthereumAddress} from "../helpers/strings";
import {BadRequest} from "@tsed/exceptions";
import {Account} from "../../prisma/generated/prisma";
import {isArray} from "@tsed/core";
import {ZkSyncService} from "./ZkSyncService";

export type KeysOf<SomeInterface> = Extract<keyof SomeInterface, string>;

@Injectable()
export class AccountsRepository extends BaseRepository {
    @Inject()
    app: ZZApp;

    @Inject()
    zk: ZkSyncService

    protected guarded: KeysOf<AccountModel>[] = [
        'email'
    ];

    protected deserialize<AccountModel>(obj: null | Account | Account[]): AccountModel {
        const guard = (item: Account): Account => {
            for (let i = 0; i < this.guarded.length; ++i) {
                //@ts-ignore
                delete item[this.guarded[i]];
            }
            //@ts-ignore
            return item;
        }
        console.log(obj);
        if (isArray(obj)) {
            obj = obj.map((item) => guard(item));
        } else if(obj) {
            obj = guard(obj);
        }
        return super.deserialize(obj);
    }

    countAccounts() {
        return this.collection.count();
    }

    findByAddress(address: string) {
        return this.collection.findUnique({where: {address}})
    }

    async signup(address: string, data: UpdateAccountParams = {}) {
        if (data.displayName) {
            if (isValidEthereumAddress(data.displayName)) {
                throw new BadRequest("Cannot set your display name to an address")
            }
        }
        if (!isValidEthereumAddress(address)) {
            throw new BadRequest("Invalid address")
        }

        const ret = await this.create({
            data: {
                ...data,
                address: this.zk.getChecksumAddress(address)
            }
        })
        await this.app.maybeResyncAddress(address);
        return ret;
    }

    async updateAccount(address: string, data: UpdateAccountParams) {
        const ret = await this.update({
            where: {address},
            data
        })
        return ret;
    }

    async getByAddress(address: string) {
        return this.findFirst({
            where: {
                address: this.zk.getChecksumAddress(address)
            }
        })
    }
}
