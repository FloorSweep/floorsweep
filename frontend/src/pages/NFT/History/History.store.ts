import {computed, makeObservable, observable} from "mobx";
import {EmptyClass} from "../../../helpers/mixins";
import {Loadable} from "../../../services/mixins/loadable";
import {Http} from "../../../services";
import {CancelableTokens} from "../../../services/mixins/cancel-tokens";
import {IconName} from "../../../components/Icon/Icon";
import {css} from "../../../helpers/css";
import {L2TxStatus, Swap} from "zksync/src/types";
import {NftHistory} from "../../../interfaces";
import AppStore from "../../../store/App.store";

export interface NftHistoryItem extends Pick<NftHistory, 'type' | 'txId'> {
    from: string,
    to: string,
    actionLabel: string,
    icon: { icon: IconName, className: string },
    price?: {currency: string, amount: string},
    createdAt?: string,
}

class HistoryStore extends Loadable(CancelableTokens(EmptyClass)) {

    @observable
    private _items: NftHistory[] = []

    constructor(private tokenId: string) {
        super()
        makeObservable(this)
        this._cancelable_tokens_construct("HISTORYSTORE")
    }

    init() {
        return this.tapWithLoading(() => this.getHistory())
    }

    private async getHistory() {
        const {data} = await Http.guest.get<NftHistory[]>(`/nft/${this.tokenId}/history`, {
            cancelToken: this.generate(`getHistory:${this.tokenId}`),
        })
        this._items = data as any;
    }

    @computed
    get items(): NftHistoryItem[] {
        return this._items.map(item => {
            const ret: NftHistoryItem = {
                from: item.from,
                to: item.to,
                actionLabel: HistoryStore.getActionLabel(item.type),
                icon: HistoryStore.getStatusIcon(item.tx.status),
                type: item.tx.op.type,
                txId: item.txId,
                createdAt: item.tx.createdAt ? new Date(item.tx.createdAt).toLocaleString() : undefined,
            }

            if (ret.type === "Swap") {
                const swap = item.tx.op as Swap
                const sellNftOrder = swap.orders.filter(order => order.tokenSell === Number(this.tokenId))[0]
                const swappedCurrency = sellNftOrder.tokenBuy
                const swappedAmount = sellNftOrder.ratio[1]

                const formattedPrice = AppStore.auth.tokenSet?.formatToken(swappedCurrency, swappedAmount)
                const formattedToken = AppStore.auth.tokenSet?.resolveTokenSymbol(swappedCurrency)
                if (formattedPrice && formattedToken) {
                    ret.price = {currency: formattedToken, amount: formattedPrice}
                }
            }
            return ret
        })
    }

    @computed
    get hasData() {
        return this._items.length > 0
    }

    private static getActionLabel(type: string) {
        switch (type) {
            case "Transfer":
                return "transferred to";
            case "Swap":
                return "swapped with"
            case "MintNFT":
                return "minted to"
            case "WithdrawNFT":
                return "withdraw to"
            default:
                return "..."
        }
    }

    private static getStatusIcon(status: L2TxStatus): { icon: IconName, className: string } {
        switch (status) {
            case "finalized":
                return {icon: 'check', className: css('text-green-600')}
            case "rejected":
                return {icon: 'close', className: css('text-red-600')}
            case "committed":
                return {icon: 'check', className: css('text-neutral-600')}
            case "queued":
                return {icon: 'stack', className: css('text-neutral-600')}
            default:
                return {icon: 'question', className: css('text-neutral-600')}
        }
    }
}

export default HistoryStore
