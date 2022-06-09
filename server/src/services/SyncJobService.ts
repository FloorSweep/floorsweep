import {Inject} from "@tsed/di";
import {Agenda} from "@tsed/agenda";
import {Logger} from "@tsed/logger";
import {ZkSyncService} from "./ZkSyncService";
import axios from "axios";
import {NftsRepository} from "./NftsRepository";
import {NFT} from "zksync/build/types";
import {ZZApp} from "./ZZApp";
import {AccountsRepository} from "./AccountsRepository";
import {NFTWithStatus} from "../interfaces/Nft.interfaces";
import {NftStatus, PendingTradesRepository} from "../../prisma/generated/tsed";
import {Nft} from "../../prisma/generated/prisma";
import {AGENDA_PRIORITY_HIGH, AGENDA_PRIORITY_LOW, AGENDA_PRIORITY_MAX, AGENDA_PRIORITY_NORMAL} from "../constants";
import {sleep} from "zksync/build/utils";

@Agenda({namespace: "sync"})
export class SyncJobService {
    @Inject()
    protected app: ZZApp;
    @Inject()
    protected zk: ZkSyncService;
    @Inject()
    protected logger: Logger;
    @Inject()
    private nfts: NftsRepository;

    @Inject()
    private accounts: AccountsRepository;

    @Inject()
    private pendingTrades: PendingTradesRepository;

    /**
     *
     * shouldSkipSync
     *
     * Description:
     * Place for CUSTOM LOGIC for skipping NFT sync. Useful for ommitting some debug NFTs we don't
     * longer need/slow down the sync.
     *
     */
    private shouldSkipSync(nft: NFT) {
        const cid = this.zk.getCIDfromContentHash(nft.contentHash);
        //this one is some old nft without uploaded metadata...
        if (cid === "Qmb6B4YQYAfVskyDK8HVtejDYVUUCa1gqnmuBg8tGXZchT") {
            return true;
        }
        return false;
    }

    /**
     * processAddress
     *
     * Description:
     * -ACTUAL- job for processing an address. Can be scheduled by running `resyncAddress`
     *
     */
    async processAddress(address: string, skipTokenIds: number[] = [], maxCount = 0) {
        const {owned, minted} = await this.zk.getUserNFTs(address, "any");
        // console.log("debug:: owned, minted", owned, minted)

        this.logger.info("found " + owned.length + "/" + minted.length + " nfts");

        /*
        *
        *           -----       MAIN ASSUMPTIONS     ------
        *           1. RESYNC means we query DIRECTLY from zk network, so no cache should be used for any of the data.
        *              It means we won't to CACHE IN OUR DB the state of zkSync. NO REDIS ETC USED for querying owners etc
        *           2. That's why, we will be making a lot of queries to zkSync, and WE MAY BE RATE LIMITED. That's why
        *              NOT A SINGLE NFT SHOULD BE REFRESHED MORE OFTEN THAN ONCE PER 10 SECONDS.
        *
        *              So: debounce(10sec, processNft)
        *           3. There are multiple job types. Inserting `syncAddress()` will insert multiple `syncNft`, with
        *              each NFT, if already in the queue, should not be inserted again.
        *              Each NFT is then synced in parallel batches of 10 jobs at once.
        *
        *
        *
         */
        const account = await this.accounts.findFirst({
            where: {
                address
            }
        });
        const getPriority = (i: number) => {
            let baseline;
            if (account && !account.lastSyncedAt) {
                // we are syncing account for first time, give it higher priority
                baseline = AGENDA_PRIORITY_MAX
            } else {
                baseline = AGENDA_PRIORITY_HIGH;
            }

            if (i < 10) {
                return baseline;
            } else if (i < 20) {
                return baseline - 100;
            } else if (i < 100) {
                return baseline > AGENDA_PRIORITY_NORMAL ? AGENDA_PRIORITY_NORMAL : baseline;
            } else {
                return AGENDA_PRIORITY_LOW
            }
        }
        const startAt = new Date();
        const promises = [];
        // const add = async (nft: NFTWithStatus, i: number) => {
        //     if (skipTokenIds.indexOf(nft.id) >= 0) {
        //         console.log(`Skipping ${nft.id}.......`)
        //         return;
        //     }
        //     promises.push(this.app.maybeResyncNFT(nft, "1 second", 0, getPriority(i)));
        // }
        const rows = ([] as NFTWithStatus[]).concat(minted, owned);
        let countAdded = 0;
        let newSkipTokenIds = ([] as any[]).concat(skipTokenIds);
        let i;
        if (rows.length > 1000) {
            // dont sync zkPunks
            this.logger.info("skip rows.length > 1000");
            await this.accounts.update({where: {address}, data: {lastSyncedAt: new Date()}});
            return {owned, minted}
        }
        for (i = 0; i < rows.length; ++i) {
            const nft = rows[i];
            if (skipTokenIds.indexOf(nft.id) >= 0) {
                // console.log(`Skipping ${nft.id}.......`)
                continue;
            }
            if (countAdded > maxCount) {
                break;
            }
            ++countAdded;
            newSkipTokenIds.push(nft.id);
            promises.push(this.app.maybeResyncNFT(nft, "1 second", 0, getPriority(i)));
        }
        /*
            TODO: possible memory overload, adding thousands of promises may go over the limit.
            As to database connections, tested with thousands of promises and system remain responsive
         */
        console.log(`Waiting for ${promises.length} promises...`);
        await Promise.all(promises);
        console.log(`Finished waiting for ${promises.length} promises...`);
        await this.accounts.update({where: {address}, data: {lastSyncedAt: new Date()}});
        if (countAdded > maxCount) {
            this.logger.info(`Scheduling next sync batch for address=${address} at index=${i}/${rows.length}`);
            await this.app.maybeResyncAddress({
                address,
                skipTokenIds: newSkipTokenIds
            }, "10 seconds", 9999, AGENDA_PRIORITY_NORMAL);
        } else {

            this.logger.info(`NOT scheduling next batch`);
        }
        return {owned, minted}
    }

    async processNft(nft: NFTWithStatus) {
        this.logger.info(`[sync::enter] nft=${nft.id}`)
        // console.log("debug:: NFT WITH STATUS CALL", nft)
        const tokenId = nft.id;
        if (!nft.id) {
            throw new Error("Invalid NFT object, id null or undefined!")
        }
        if (this.shouldSkipSync(nft)) {
            throw new Error("NFT is on ignore list");
        }
        const dbnft = await this.nfts.findFirst({
            where: {
                tokenId
            }
        })
        const isInserting = !dbnft;
        if (dbnft && dbnft.metadata) {
            this.logger.warn(`nft=${dbnft.tokenId} already in db`);
            // TODO: we can perform additional safety checks ie if ownerAddress is the same etc and warn in any case
        } else {
            this.logger.warn(`[~NEW~NEW~NEW] Found new nft=${tokenId} !!!`);
        }

        const contentHash = nft.contentHash,
            cid = this.zk.getCIDfromContentHash(contentHash);
        let status = nft.status;

        const ownerAddress = await this.nfts.determineOwnerOf(tokenId);
        if (!ownerAddress) {
            throw new Error("Owner Address is null");
        }

        // 3 ========o ------
        // DETECT ONGOING SWAP
        // 3 ========o ------

        if (await this.nfts.isSwapInProgress(tokenId)) {
            this.logger.warn(`[SWAP] SWAP DETECTED!!!!!!1`)
            status = NftStatus.swapping;
            // check again in one minute if nft is still swapping
            console.log(`Swap detected, trying to schedule resync of nft=${nft.id} in one minute`);
            // we allow 1 pending job in queue, because it's probably the one that's being processed right now
            await this.app.maybeResyncNFT(nft, "1 minute", 1);
        }
        // in case of newly minted NFT, the owner is null
        if (!await this.zk.getNFTOwnerAddress(tokenId)) {
            // reschedule soon to update the status
            await this.app.maybeResyncNFT(nft, "1 minute", 1);
        }

        try {
            const {data: metadata} = await axios.get(`https://zznft.mypinata.cloud/ipfs/${cid}`);
            const imageCID = await this.nfts.getImageCIDByContentHash(cid);
            if (!imageCID) {
                throw new Error(`Could not get image CID for nft ${nft.id}`)
            }
            const fields: Partial<Nft> = {
                address: this.zk.getChecksumAddress(nft.address),
                tokenId: nft.id,
                metadataCID: cid,
                imageCID,
                zkContentHash: contentHash,
                creatorAddress: this.zk.getChecksumAddress(nft.creatorAddress),
                ownerAddress: ownerAddress,
                metadata: metadata,
                isVisible: dbnft ? dbnft.isVisible : true,
                nftObject: nft as object,
                lastValidatedAt: new Date(),
                status,
                name: metadata.name
            }
            if (isInserting) {
                const size = await this.nfts.getIpfsImageSize(imageCID);
                console.log(size);
                fields.imgWidth = size.width;
                fields.imgHeight = size.height;
            }
            if (isInserting) {
                this.logger.info(`[INSERT] Inserting new nft=${tokenId}`);
            } else {
                this.logger.info(`[UPDATE] Updating nft=${tokenId}`);
            }
            // this.logger.debug(fields);
            await this.nfts.upsert({
                where: {tokenId: nft.id},
                // prisma being prisma..
                //@ts-ignore
                update: fields,
                // prisma being prisma..
                //@ts-ignore
                create: fields
            })
        } catch (e) {
            console.error(e);
            // TODO: doesnt work
            if (e.response && e.response.status == 404) {
                this.logger.info(`Could not get metadata for ${nft.id} :: hiding from view`)
            }
            try {
                await this.nfts.update({where: {id: nft.id}, data: {isVisible: false}})
            } catch (e) {
                //silence...
                console.error(e);
            }
        }
    }

    /**
     *
     * validateMetadatas
     *
     * Description:
     * Run through existing NFTs and check if metadata is still available.
     */
    async validateMetadatas() {
        // TODO: where lastValidatedAt <= 5min
        const nfts = await this.nfts.findMany();
        for (let i = 0; i < nfts.length; ++i) {
            const nft = nfts[i];
            try {
                // await this.processNft(JSON.parse(nft.nftObject));
                try {
                    const res = await axios.get(`https://zznft.mypinata.cloud/ipfs/${nft.metadataCID}`);
                } catch (e) {
                    this.logger.error(`NFT #${nft.id} VALIDATION FAILED! HIDING NFT FROM THE FEED`);
                    await this.nfts.update({where: {id: nft.id}, data: {isVisible: false}});
                    continue;
                }
                await this.nfts.update({
                    where: {id: nft.id}, data: {
                        lastValidatedAt: new Date()
                    }
                })
            } catch (e) {
                this.logger.error(`ERROR VALIDATING NFT=${nft.id}`)
                console.error(e);
                // do nothing...
            }
        }
    }
}
