import {Controller, Inject} from "@tsed/di";
import {Delete, Get, Post} from "@tsed/schema";
import {NftStatus, OrdersRepository, PendingTradesRepository} from "../../../prisma/generated/tsed";
import {BodyParams, Context} from "@tsed/platform-params";
import {Logger} from "@tsed/logger";
import {CURRENT_ACCOUNT_CONTEXT_KEY} from "../../middlewares/auth/constants";
import {Order} from "zksync/build/types";
import {Account} from "../../../prisma/generated/prisma";
import {ZkSyncService} from "../../services/ZkSyncService";
import {PlatformCache, QueryParams} from "@tsed/common";
import {UseJoiSchema} from "../../decorators/UseJoiSchema";
import {ListOrderSchema} from "../../schemas/ListOrderSchema";
import {UseAuth} from "@tsed/platform-middlewares";
import {AuthMiddleware} from "../../middlewares/auth/AuthMiddleware";
import {isAddressesEqual} from "../../helpers/strings";
import {BadRequest} from "@tsed/exceptions";
import {BigNumber} from "ethers";
import {ZZApp} from "../../services/ZZApp";
import {ZKSyncTxError} from "zksync/build/operations";
import {NftsRepository} from "../../services/NftsRepository";
import {ORDER_STATUS_COMPLETED, ORDER_STATUS_NEW} from "../../config";

@Controller("/order")
export class OrderController {
    @Inject()
    private logger: Logger

    @Inject()
    private zk: ZkSyncService

    @Inject()
    private orders: OrdersRepository

    @Inject()
    private app: ZZApp

    @Inject()
    private nfts: NftsRepository

    @Inject()
    private pendingTrades: PendingTradesRepository;

    @Inject()
    cache: PlatformCache;

    @Post("/list")
    @UseAuth(AuthMiddleware)
    async list(
        @BodyParams("order")
        @UseJoiSchema(ListOrderSchema) order: Order,
        @Context(CURRENT_ACCOUNT_CONTEXT_KEY) account: Account
    ) {
        this.logger.info(`CREATING NEW ORDER: ${JSON.stringify(order)}`)

        try {
            this.zk.resolveTokenSymbol(order.tokenBuy)
        } catch (e) {
            throw new BadRequest("Buy token does not exist")
        }

        const existingOrder = await this.orders.findFirst({
            where: {
                tokenId: order.tokenSell,
                status: ORDER_STATUS_NEW
            }
        })
        if (existingOrder) {
            throw new BadRequest("NFT is already for sale. Please de-list first.")
        }

        const ownerExistingOrder = await this.orders.findFirst({
            where: {
                status: ORDER_STATUS_NEW,
                nft: {ownerAddress: account.address}
            }
        })
        if (ownerExistingOrder) {
            throw new BadRequest(`Please cancel listing for ${ownerExistingOrder.nft.tokenId} before listing another token.`)
        }

        const ownerAddress = await this.zk.getNFTOwnerAddress(order.tokenSell)
        if (!ownerAddress) {
            throw new BadRequest("Stop hacking plz");
        }

        if (!isAddressesEqual(ownerAddress, account.address)) {
            throw new BadRequest("Cannot sell someone else's NFT")
        }

        const addressNonce = await this.zk.getAddrNonce(account.address)
        if (order.nonce !== addressNonce) {
            throw new BadRequest("Account nonce is out of sync")
        }

        const base = BigNumber.from(order.ratio[0])
        const quote = BigNumber.from(order.ratio[1])
        const zkCurrencyId = order.tokenBuy
        const humanReadablePrice = Number(this.zk.getTokenQuantityFormatted(zkCurrencyId, quote.div(base)))
        const zkCurrencySymbol = this.zk.resolveTokenSymbol(zkCurrencyId)
        const dbOrder = await this.orders.create({
            data: {
                zkCurrencyId,
                zkCurrencySymbol,
                tokenId: order.tokenSell,
                nonce: order.nonce,
                //@ts-ignore
                zkOrder: order,
                price: humanReadablePrice,
                status: ORDER_STATUS_NEW,
                sellerAddress: account.address
            }
        })
        return {order: dbOrder}
    }

    @Get("/")
    async getOrders(
        @QueryParams("ownerAddress") ownerAddress: string
    ) {
        let orders = []
        const baseQuery = {
            status: ORDER_STATUS_NEW,
        }
        if (ownerAddress) {
            orders = await this.orders.findMany({where: {...baseQuery, nft: {ownerAddress}}})
        } else {
            orders = await this.orders.findMany({where: baseQuery})
        }
        return orders
    }

    @Delete("/")
    @UseAuth(AuthMiddleware)
    async delete(
        @BodyParams() params: any,
        @Context(CURRENT_ACCOUNT_CONTEXT_KEY) account: Account
    ) {
        // TODO: make sure user has signed a 0 transfer tx & delete order from db
        this.logger.info(`Delete order`)
        const order = await this.orders.findFirst({
            where: {
                status: ORDER_STATUS_NEW,
                tokenId: params.tokenId,
                nft: {ownerAddress: account.address}
            }
        })
        if (!order) {
            throw new BadRequest("No order found")
        }

        const receipt = await this.zk.submitSignedTransaction(params.tx)
        await this.orders.delete({where: {id: order.id}})
        return {receipt}
    }

    @Post("/submit")
    @UseAuth(AuthMiddleware)
    async submitOrder(
        @BodyParams() params: any,
        @Context(CURRENT_ACCOUNT_CONTEXT_KEY) account: Account
    ) {
        const [order1, order2] = params.tx.tx.orders

        if (order1.tokenBuy !== order2.tokenSell || order1.tokenSell !== order2.tokenBuy) {
            throw new BadRequest("Orders are not compatible")
        }

        const isBuyTokenNFT = await this.zk.isTokenNFT(order1.tokenBuy)
        const isSellTokenNFT = await this.zk.isTokenNFT(order1.tokenSell)
        // Only one side can be an NFT, XOR
        if (!isBuyTokenNFT && !isSellTokenNFT) {
            throw new BadRequest("Orders do not include NFTs")
        }
        if (isBuyTokenNFT && isSellTokenNFT) {
            throw new BadRequest("Cannot trade NFT for NFT")
        }

        const tokenId = isBuyTokenNFT ? order1.tokenBuy : order1.tokenSell;
        const nft = await this.nfts.findFirst({
            where: {
                tokenId
            }
        })
        if (!nft) {
            throw new BadRequest("We don't have this nft");
        }
        let order = await this.orders.findFirst({
            where: {
                tokenId,
                status: ORDER_STATUS_NEW
            }
        })
        if (!order) {
            throw new BadRequest("Could not find order")
        }

        const tx = await this.zk.submitSignedTransaction(params.tx)
        this.logger.info(`[SELL] Selling nft tokenId=${tokenId} from addr=${order.sellerAddress} to addr=${account.address}, with tx=${tx.txHash}`)
        this.logger.info({
            order,
            order1,
            order2,
            tx,
            tokenId
        })

        try {
            const receipt = await tx.awaitReceipt()
            const apiTx = await this.zk.restProvider.txData(tx.txHash)
            // TODO: run these in a transaction
            order = await this.orders.update({
                where: {id: order.id},
                data: {
                    status: ORDER_STATUS_COMPLETED,
                    txId: tx.txHash,
                    buyerAddress: account.address
                }
            })
            await this.pendingTrades.create({
                data: {
                    tokenId,
                    status: apiTx.tx.status,
                    txHash: tx.txHash,
                    txData: JSON.stringify(tx.txData),
                    fromAddress: order.sellerAddress!,
                    toAddress: order.buyerAddress!,
                }
            })
            try {
                // mark immediately nft as swapping for UI to reflect change.
                // sync job will recalculate whole state in a sec
                // clear cache
                await this.cache.del(`token-history-${tokenId}-endpoint`);
                /*
                    TODO: MAYBE ALSO UPDATE ownerAddress?
                    Currently after page refresh, owner is still old, but NFT is already 'swapping'
                    Question is, if we got to here, were basic checks ie sufficient balance etc made by zkSync?
                 */
                await this.nfts.update({
                    data: {
                        status: NftStatus.swapping,
                        ownerAddress: account.address
                    },
                    where: {
                        tokenId: tokenId
                    }
                })
                await this.app.maybeResyncNFT({id: nft.tokenId, creatorAddress: nft.creatorAddress}, "2 seconds")
            } catch (e) {
                this.logger.error(e);
            }
            return {receipt}
        } catch (e) {
            if (e instanceof ZKSyncTxError) {
                // @ts-ignore
                if (e.value.failReason) {
                    // @ts-ignore
                    throw new BadRequest(e.value.failReason)
                }
                throw new BadRequest("zkSync error")
            }
            this.logger.error(e)
            this.logger.error("Could not submit order")
            throw new BadRequest("Could not submit order")
        }
    }
}
