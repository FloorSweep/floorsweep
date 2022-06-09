import {Inject} from "@tsed/di";
import {ApiTransaction} from "zksync/build/types";
import {ZkSyncService} from "./ZkSyncService";
import {ZZApp} from "./ZZApp";

export class TxHistoryIterator {

    @Inject()
    private app: ZZApp;

    private data?: ApiTransaction[];
    private address: string;
    private curFrom: string = "latest";

    constructor(address: string, from: string | null, private includeCurFromHash: boolean, private zkSync: ZkSyncService) {
        this.address = address;
        this.zkSync = zkSync;
        this.curFrom = from ? from : "latest";
    }

    curAddress() {
        return this.address;
    }

    private async loadNext() {
        const res = await this.zkSync.restProvider.accountTxs(this.address, {
            from: this.curFrom ?? "latest",
            limit: 10,
            direction: "older"
        });
        if (res.list.length) {
            if (res.list.length === 1 && this.curFrom.toLowerCase() === res.list[0].txHash.toLowerCase()) {

                // TODO: make sure we dont process curFrom if we are in it.next() loop.
                // IF curFrom was set manually by user, we should normally process it.
            }
            this.curFrom = res.list[res.list.length - 1].txHash;
            //
            // IMPORTANT!!!!!
            //
            // when we query the next batch, zkSync returns also the `curFrom` hash in results. we don't want to process it again
            this.includeCurFromHash = false;
        } else {
            this.curFrom = "latest";
        }
        if (res.list.length == 0) {
            return [];
        }
        return res.list;
    }

    async next(): Promise<ApiTransaction | undefined> {
        if (this.data === undefined || this.data.length === 0) {
            this.data = await this.loadNext();
        }
        if (this.data.length === 0) {
            return undefined;
        }
        const ret = this.data.shift();
        if (ret && ret.txHash === this.curFrom && !this.includeCurFromHash) {
            return this.next();
        }
        return ret;
    }


}
