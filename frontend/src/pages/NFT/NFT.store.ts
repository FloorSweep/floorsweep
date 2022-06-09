import {computed, makeObservable, observable} from "mobx";
import {Attribute, NFT, OrderStatus} from "../../interfaces";
import {Http} from "../../services";
import AppStore from "../../store/App.store";
import {successToast} from "../../components/Toast/Toast";
import {BigNumber} from "ethers";
import {CancelableTokens} from "../../services/mixins/cancel-tokens";
import {EmptyClass} from "../../helpers/mixins";
import {Loadable} from "../../services/mixins/loadable";
import {isProduction} from "../../environment/helpers";
import HistoryStore from "./History/History.store";
import {jsonify} from "../../helpers/strings";


class NFTStore extends CancelableTokens(Loadable(EmptyClass)) {
    @observable
    nft?: NFT

    @observable
    listAmount = ""

    @observable
    listCurrency = "ETH"

    @observable
    readonly history: HistoryStore

    constructor(private tokenId: string) {
        super()
        makeObservable(this)
        this._cancelable_tokens_construct("NFTSTORE")
        this.history = new HistoryStore(tokenId)
    }

    init() {
        this.history.init()
        return this.tapWithLoading(() => Promise.all([this.getNFT(), this.refreshOrders()]))
    }

    async refreshOrders() {
        await this.getNFT()
        await AppStore.auth.getUserOrders()
    }

    async getNFT() {
        const {data} = await Http.guest.get<NFT>(`/nft/${this.tokenId}`, {
            cancelToken: this.generate(`getNft:${this.tokenId}`),
        })
        this.nft = data
        console.log("debug:: NFT", this.nft?.salePrice, this.nft?.saleCurrency)
    }

    @computed
    get metadata() {
        return this.nft && this.nft.metadata ? this.nft.metadata : undefined
    }

    @computed
    get attributes() {
        let attributes: Attribute[] | undefined
        if (this.metadata?.attributes) {
            if (typeof this.metadata.attributes === "string") {
                attributes = JSON.parse(this.metadata.attributes)
            } else if (Array.isArray(this.metadata.attributes)) {
                attributes = this.metadata.attributes
            }
        }
        const nonEmptyItems = attributes?.filter(item => {
            if (item.trait_type !== "" || item.value !== "") {
                return true
            }
            return false
        })
        return nonEmptyItems
    }

    @computed
    get isAttributesValid() {
        return this.attributes && Array.isArray(this.attributes) && this.attributes.length > 0
    }

    @computed
    get currencySelectItems() {
        const items = [
            {name: "ETH", id: "ETH"},
            {name: "USDC", id: "USDC"},
            {name: "USDT", id: "USDT"},
            {name: "DAI", id: "DAI"},
        ]
        if (isProduction()) {
            items.push({name: "WBTC", id: "WBTC"})
        }
        return items
    }

    @computed
    get newOrder() {
        return this.nft?.order.filter(order => order.status === OrderStatus.new)[0]
    }

    @computed
    get isNFTForSale() {
        return this.nft?.isForSale
    }

    @computed
    get isNftListable() {
        return this.isAuthedUserOwner && this.nft?.status === 'verified';
    }

    @computed
    get isAuthedUserOwner() {
        return this.nft && this.nft?.ownerAddress === AppStore.auth.account?.address
    }

    async onListSubmit() {
        const order = await AppStore.auth.getSellNFTOrder(
            this.nft!.tokenId,
            this.listCurrency,
            this.listAmount
        )
        await Http.authed.post("/order/list", {order}, {
            cancelToken: this.generate(`list:${this.nft!.tokenId}`),
            signerHumanMessage: `List NFT: ${this.nft!.tokenId}`
        })
        await this.refreshOrders()
        successToast(`NFT #${this.nft?.tokenId} was listed`)
    }

    async onDelistSubmit() {
        const zeroTx = await AppStore.auth.getZeroTransferToSelf("ETH")
        await Http.authed.delete("/order", {
            cancelToken: this.generate(`delist:${this.nft!.tokenId}`),
            data: {
                tx: zeroTx,
                tokenId: this.nft!.tokenId
            },
            signerHumanMessage: `Delist NFT #${this.nft!.tokenId}`
        })
        await this.refreshOrders()
        successToast(`NFT #${this.nft?.tokenId} was delisted`)
    }

    async onBuySubmit() {
        const saleCurrency = this.nft!.saleCurrency
        const salePrice = this.nft!.salePrice
        const tokenId = this.nft!.tokenId

        const nftTokenPrice = this.newOrder?.zkOrder!.ratio[0]
        if (!BigNumber.from(nftTokenPrice).eq("1")) {
            throw new Error("NFT token price is not 1. Something is wrong")
        }

        console.log(`debug:: user is selling #${tokenId} (${nftTokenPrice}) for token ${saleCurrency} (${salePrice})`)
        const order = await AppStore.auth.getBuyNFTOrder(
            tokenId,
            saleCurrency!,
            salePrice!.toString()
        )
        const swapTx = await AppStore.auth.getSwap({
            orders: [this.newOrder!.zkOrder, order!],
            feeToken: "ETH"
        })
        await Http.authed.post("/order/submit", {tx: swapTx}, {
            signerHumanMessage: `Buy NFT #(${tokenId})`,
            cancelToken: this.generate(`submitOrder:${tokenId}`)
        })
        await this.refreshOrders()
        successToast(`#${tokenId} NFT purchased`)
    }

    @computed
    get orderPrice() {
        const ratio = this.newOrder?.zkOrder.ratio
        const base = BigNumber.from(ratio?.[0])
        const quote = BigNumber.from(ratio?.[1])
        return quote.div(base)
    }

    @computed
    get orderPriceHumanReadable() {
        return this.nft?.salePrice
    }

    @computed
    get orderBidTokenSymbol() {
        return this.nft?.saleCurrency
    }

    @computed
    get userHasSufficientFundsToPurchase() {
        if (this.orderBidTokenSymbol && this.newOrder) {
            const balance = AppStore.auth.balances?.[this.orderBidTokenSymbol]
            if (balance) {
                return BigNumber.from(balance).gte(this.orderPrice)
            }
            return false
        }
        return false
    }

    @computed
    get nftHasSize() {
        return !!this.nft?.imgWidth && !!this.nft?.imgHeight
    }
}

export default NFTStore
