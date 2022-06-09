import {Inject, Injectable} from "@tsed/di";
import {IpfsService} from "./IpfsService";
import {Logger} from "@tsed/cli-core";
import {SignedTransaction} from "zksync/build/types";
import {MintNFT} from "zksync/src/types";
import {ZkSyncService} from "./ZkSyncService";
import {NftModel, NftsRepository as BaseRepository, PendingTradesRepository} from "../../prisma/generated/tsed";
import {ZZApp} from "./ZZApp";
import {PinataService} from "./PinataService";
import {Account, Nft} from "prisma/generated/prisma";
import {Readable} from "stream";
import {GetNftsQueryParameters} from "../interfaces/generated";
import {TxHistoryIterator} from "./TxHistoryIterator";
import axios from "axios";
import {ORDER_STATUS_NEW} from "../config";
import {KeysOf} from "./AccountsRepository";
import {BadRequest} from "@tsed/exceptions";
import {AGENDA_PRIORITY_MAX} from "../constants";

const http = require('http')
const https = require('https')

const sizeOf = require('image-size')

@Injectable()
export class NftsRepository extends BaseRepository {
    @Inject()
    private ipfs: IpfsService

    @Inject()
    private pinata: PinataService

    @Inject()
    private zkSync: ZkSyncService

    @Inject()
    private logger: Logger

    @Inject()
    private app: ZZApp;

    @Inject()
    private pendingTrades: PendingTradesRepository;

    private addNftExtraData = (nft: NftModel) => {
        const newOrder = nft.order.find(order => order.status === ORDER_STATUS_NEW)
        let salePrice, saleCurrency
        //@ts-ignore
        nft.isForSale = !!newOrder

        if (newOrder) {
            //@ts-ignore
            nft.salePrice = newOrder.price
            //@ts-ignore
            nft.saleCurrency = newOrder.zkCurrencySymbol
        } else {
            //@ts-ignore
            nft.salePrice = undefined
            //@ts-ignore
            nft.saleCurrency = undefined
        }

        //@ts-ignore
        nft.imageUrl = `https://zznft.mypinata.cloud/ipfs/${nft.imageCID}`;
        //@ts-ignore
        nft.metadataUrl = `https://zznft.mypinata.cloud/ipfs/${nft.metadataCID}`
        if (nft.imageCID.indexOf(".svg") >= 0) {
            // make svgs look bigger
            const size = 1500;
            if (nft.imgWidth && nft.imgHeight && nft.imgWidth < size) {
                const m = size / nft.imgWidth;
                nft.imgWidth *= m;
                nft.imgHeight *= m;
            }
        }
    }

    /**
     *
     * countNfts
     *
     * Description:
     * Return count of visible nfts
     */
    async countNfts() {
        return this.collection.count();
    }

    /**
     * uploadNftImage
     *
     * Description:
     * Returns ipfs hash
     */
    uploadNftImage(uploader: Account, file: Express.Multer.File): Promise<string> {
        const stream = new Readable();
        stream.push(file.buffer);
        stream.push(null);
        // https://github.com/PinataCloud/Pinata-SDK/issues/28
        //@ts-ignore
        stream.path = "some_filename.png";
        return this.pinata.uploadBlob(`${uploader.id}-image-${Date.now()}`, stream);
    }

    async mintNFT(tx: SignedTransaction) {

        if (tx.tx.type !== "MintNFT") {
            throw new Error("Transaction must be of type MintNFT")
        }

        const syncTx = await this.zkSync.submitSignedTransaction(tx);
        const receipt = await syncTx.awaitReceipt();
        const {recipient, creatorAddress} = tx.tx as MintNFT;

        const _normal_txData = await this.zkSync.restProvider.txData(syncTx.txHash);
        const tokenId = await this.zkSync.zkProvider.getNFTIdByTxHash(syncTx.txHash);
        this.logger.info("YYY_YYY");
        this.logger.info(tokenId);
        // Calling getNFT here will result with:
        // "Requested NFT doesn't exist or the corresponding mintNFT operation is not verified yet"
        // const __nft__ = await this.zkSync.zkProvider.getNFT(tokenId);
        await this.pendingTrades.create({
            data: {
                tokenId: tokenId,
                status: _normal_txData.tx.status,
                txHash: _normal_txData.tx.txHash,
                txData: JSON.stringify(_normal_txData),
                fromAddress: (_normal_txData.tx.op as MintNFT).creatorAddress,
                toAddress: (_normal_txData.tx.op as MintNFT).creatorAddress,
            }
        })
        await this.app.maybeResyncNFT({
            id: tokenId,
            creatorAddress: (_normal_txData.tx.op as MintNFT).creatorAddress
        }, "1 seconds", 0, AGENDA_PRIORITY_MAX);
        return {tx: syncTx, receipt, tokenId};
    }

    async uploadMetadata(assetCID: string, name: string, description: string, attrs: any[]) {

        // zkSync allows multiple NFTs with same contentHash & assetCID, so we cannot enforce uniqueness
        // // Check if we already have this image registered, so no same image is submitted twice
        // // TODO: list of submitted binaries should be stored on chain
        // const existingAsset = await this.nfts.findFirst({
        //     where: {
        //         asset_cid: assetCID
        //     }
        // })
        // if (existingAsset !== null) {
        //     throw new Forbidden("NFT already exists");
        // }

        const metadata = {
            image: `ipfs://${assetCID}`,
            name: name,
            description: description,
            attributes: attrs
        }
        // SO! json encoding IS VERY IMPORTANT, if we change encoding even by one space, we will get different CID, and different token id by this...
        const metadataCID = await this.pinata.uploadJSON(`${assetCID}-metadata.json`, metadata);
        const contentHash = this.zkSync.getContentHashFromCID(metadataCID)
        return {
            metadataCID,
            contentHash,
            metadata
        }
    }

    async cursorPaginate(queryParams: GetNftsQueryParameters & Partial<Pick<Nft, 'status' | 'isVisible'>>) {
        const pageSize = queryParams.pageSize
        const cursor = queryParams.cursor
        delete queryParams.pageSize
        delete queryParams.cursor

        const orderBy = 'id' as KeysOf<Nft>;
        const data = await this.findMany({
            where: {...queryParams},
            orderBy: {[orderBy]: 'desc'},
            take: pageSize ? pageSize : 15,
            cursor: cursor ? {[orderBy]: cursor} : undefined,
            skip: cursor ? 1 : undefined,
            include: {
                order: true
            },
        })
        data.forEach((nft) => this.addNftExtraData(nft))
        const dataLength = data.length
        const lastItem = data[dataLength - 1]
        return {
            data,
            cursor: data.length === pageSize ? lastItem[orderBy] : undefined
        }
    }

    async getByTokenId(tokenId: number) {
        const nft = await this.findFirst({where: {tokenId}, include: {order: true}})
        if (nft) {
            this.addNftExtraData(nft)
        }
        return nft
    }

    /**
     * USED IN
     * @param tokenId
     * @param owner
     */
    fakeMarkNFTWithOwner(tokenId: any, owner: string) {
        return this.collection.update({where: {tokenId}, data: {ownerAddress: owner}})
    }

    /**
     * Downloads metadata, tries to parse out image CID
     * @param tokenId
     */
    async getImageCIDByContentHash(tokenId: any) {
        const {data: metadata} = await axios.get(`https://zznft.mypinata.cloud/ipfs/${tokenId}`);
        // TODO: VERIFY CONTENT IMAGE OF NFT TO MATCH OUR INTERNAL HASHES
        let imageCID = null;
        if (metadata && metadata.imageCID) {
            imageCID = metadata.imageCID;
        } else if (metadata && metadata.image) {
            // try to extract imageCID:
            // We should support only one format of image url, as the token hash depends of contents of metadata -
            // therefore if we are using multiple formats/domains, tokens are not unique
            // 1. ipfs://ipfs/<CID>
            let matches = (metadata.image + "").match(/ipfs:\/\/(.*)/);
            if (matches && matches.length > 0) {
                imageCID = matches[1];
            }
            // We check for deprecated format `https://ipfs.io/ipfs/`, which is NOT longer supported. All NFTs have to have same url format,
            // after we release to production we cannot change it.
            matches = metadata.image.match(/https:\/\/ipfs\.io\/ipfs\/(.*)/)
            if (matches && matches.length > 0) {
                imageCID = matches[1];
            }
        }
        return imageCID;

    }

    async getIpfsImageSize(CID: string): Promise<{ width: number, height: number, type: string }> {
        const {data} = await axios.get(`https://zznft.mypinata.cloud/ipfs/${CID}`, {responseType: 'blob'});
        const size = await new Promise((resolve) => {
            https.get(`https://zznft.mypinata.cloud/ipfs/${CID}`, function (response: any) {
                const chunks: any[] = []
                response.on('data', function (chunk: any) {
                    chunks.push(chunk)
                }).on('end', function () {
                    const buffer = Buffer.concat(chunks)
                    console.log(sizeOf(buffer))
                    resolve(sizeOf(buffer));
                })
            })
        });
        return size as any;
    }

    async getHistory(tokenId: number) {
        function _log(...msg: any) {
            console.log(msg);
        }

        const allowUnverified = true;
        const history = [];
        const nft = (await this.zkSync.restProvider.getNFTDetailed(tokenId)).result;
        let curOwner;
        if (allowUnverified) {
            // TODO: CACHE!
            curOwner = await this.determineOwnerOf(tokenId);
        } else {
            curOwner = await this.zkSync.getNFTOwnerAddress(tokenId);
        }

        if (!curOwner) {
            return [];
        }
        let it, tx, lastDate, skipTxHash;
        const __GENESIS__ = "~~ genesis ~~"
        curOwner = curOwner!.toLowerCase();
        it = new TxHistoryIterator(curOwner, null, false, this.zkSync);
        // while (curOwner !== __GENESIS__ && curOwner) {
        _log({
            msg: "txs = it.next()",
            curOwner,
        })
        const debug: any[] = [];
        let countTxs = 0;
        const MAX_HISTORY_SIZE = 100;
        while (tx = await it.next()) {
            ++countTxs;
            if (countTxs > MAX_HISTORY_SIZE) {
                this.logger.error("countTxs > 200, aborting...")
                throw new BadRequest("History not available");
            }
            // Dont' process TX'es that are in the future from last processed
            if (lastDate && new Date(tx.createdAt!) > new Date(lastDate)) {
                continue;
            }
            if (tx.status === "rejected") {
                continue;
            }
            if (tx.status === "queued" || tx.status === "committed") {
                if (!allowUnverified) {
                    // TODO: at this point actual owner can not be determined.
                    continue;
                }
            }
            if (skipTxHash && tx.txHash === skipTxHash) {
                skipTxHash = undefined;
                continue;
            }
            let fromAddress, toAddress;
            debug.push({tx});
            // TODO: contentHash may be the same for few diff nfts
            if (tx.op.type === "Swap") {
                if (tx.op.orders[0].tokenBuy === tokenId || tx.op.orders[0].tokenSell === tokenId) {
                    if (tx.op.orders[0].recipient.toLowerCase() === curOwner) {
                        toAddress = curOwner;
                        fromAddress = tx.op.orders[1].recipient.toLowerCase()
                    } else if (tx.op.orders[1].recipient.toLowerCase() === curOwner) {
                        toAddress = curOwner;
                        fromAddress = tx.op.orders[0].recipient.toLowerCase()
                    } else {
                        throw new Error("😬")
                    }
                }
            } else if (tx.op.type === "Transfer") {
                if (tx.op.token === tokenId) {
                    fromAddress = tx.op.from.toLowerCase();
                    toAddress = curOwner;
                }
            }
            // TODO: contentHash may be the same for few diff nfts
            else if (tx.op.type === "MintNFT") {
                const tokenIdFromTxHash = await this.zkSync.zkProvider.getNFTIdByTxHash(tx.txHash);
                if (tokenIdFromTxHash === tokenId) {
                    fromAddress = __GENESIS__;
                    toAddress = tx.op.creatorAddress;
                }
            }
            if (fromAddress && toAddress) {
                if (history.length && history[history.length - 1].txId === tx.txHash) {
                    throw new Error("Error! Current TX same as previous")
                }
                history.push({
                    from: fromAddress,
                    to: toAddress,
                    type: tx.op.type,
                    txId: tx.txHash,
                    tx
                })
                lastDate = tx.createdAt
                curOwner = fromAddress;


                _log({
                    msg: "NEW POINT!!",
                    txId: tx.txHash,
                    fromAddress,
                    toAddress,
                    history
                });


                if (curOwner === __GENESIS__) {
                    break;
                }
                if (curOwner !== it.curAddress()) {
                    // _log("setting iterator to " + curOwner);
                    it = new TxHistoryIterator(curOwner, tx.txHash, false, this.zkSync);
                    skipTxHash = tx.txHash
                    continue;
                } else {
                    continue;
                }
            }
        }
        // return debug;
        return history;

        // const it = new TxHistoryIterator(nft.creatorAddress);
        // let txs;
        // const owners = [];
        // while (txs = await it.next()) {
        //     for (let i = 0; i < txs.length; ++i) {
        //         const tx = txs[i];
        //         // TODO: contentHash may be the same for few diff nfts
        //         if (tx.op.type === "MintNFT" && tx.op.contentHash === nft.contentHash) {
        //             owners.push({
        //                 seller: null,
        //                 buyer: nft.creatorAddress,
        //                 date: tx.createdAt,
        //                 tx
        //             })
        //         }
        //     }
        // }

    }

    public async isSwapInProgress(tokenId: number) {
        const ownerAddress = await this.zkSync.getNFTOwnerAddress(tokenId);
        if (!ownerAddress) {
            return false;
        }
        const swappDetTecT = await this.zkSync.restProvider.getState(ownerAddress);
        const hasComMitTeDD = !!swappDetTecT.committed.nfts[tokenId];
        const hasVeriFFed = !!swappDetTecT.verified.nfts[tokenId];
        // NFTs in ongoing S W A P are present in verified, removed from committed, on previous owners `getState()`
        // on buyers `getState()` vice versa
        return !hasComMitTeDD && hasVeriFFed;
    }

    public async determineOwnerOf(tokenId: number, retries = 3): Promise<string | null> {
        const owner = await this.zkSync.getNFTOwnerAddress(tokenId);
        if (!owner || await this.isSwapInProgress(tokenId)) {
            this.logger.info(`[owner-detect] Detected swap in progress for nft=${tokenId} trying to determine the new owner...`);
            //
            // If swap is in progress, owner returned by `getNFTOwnerAddress` is the old owner(he has this nft in 'verified', but not in 'committed'
            // We have to find the new owner, the one which has this nft in 'committed', but not in 'verified'
            // We do this by looking up pending trades cache, and hopefully we will have there info who the nft was transfered to.

            // get last transaction from cache involving this token
            const lastPending = await this.pendingTrades.findFirst({
                where: {
                    tokenId
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            if (lastPending) {
                /*
                    TODO: we could also check, whether lastPending.fromAddress matches our old ownerAddress, to make sure the transaction
                    we got is the one from the oldAddress to new one, BUT we mostly care to display the most accurate info
                    about current owner, and not if this transaction was from oldAddress to new one. In case if there were
                    two transactions made for the same token, until they were 'verified', it's possible the zk.getNFTOwner()
                    returns owner few-nodes deep into the history tree. We don't care about it, we just want to display
                    the most accurate data
                 */
                this.logger.info(`[owner-detect] Found pending trade tx=${lastPending.txHash} for nft=${tokenId}...`);
                const txStatus = await this.zkSync.restProvider.txStatus(lastPending.txHash);
                if (txStatus.status === "finalized") {
                    /*
                        TODO: if we detected swap, but our last transaction from pendingTrades has status='finalized',
                        IMO that means that it should already be 'verified', so either we don't have the last transaction
                        involving this NFT in cache, or idk...
                        Until we know how to handle it, we just log for auditing
                    */
                    this.logger.warn(`[owner-detect] swap detected, but our lastPending tx in cache is status=finalized... nft=${tokenId} tx=${lastPending.txHash}`);

                }
                if (txStatus.status === "rejected") {
                    // remove this tx from cache, and let's try again the whole process
                    await this.pendingTrades.delete({
                        where: {
                            id: lastPending.id
                        }
                    });
                    // guard against infinite loops in some weird scenarios....
                    if (retries > 0) {
                        this.logger.info(`[owner-detect] lastPending tx=${lastPending.txHash} status was 'rejected', trying again to determine the owner of nft=${tokenId}, retries=${retries}...`)
                        return await this.determineOwnerOf(tokenId, --retries);
                    } else {
                        return owner;
                    }
                }
                const state = await this.zkSync.restProvider.getState(lastPending.toAddress);
                if (state.committed.nfts[tokenId]
                    && !state.verified.nfts[tokenId]) {
                    // this is the new owner!!!
                    this.logger.info(`[owner-detect] Determined new owner of token=${tokenId} in swap to be address=${lastPending.toAddress}`)
                    return lastPending.toAddress;
                }
            }
        }
        // if token is not in swap, or couldn't find the new owner, return the old one aka the 'verified' one
        return owner;
    }

}
