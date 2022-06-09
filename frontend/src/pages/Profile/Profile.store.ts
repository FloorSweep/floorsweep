import {computed, makeObservable, observable} from "mobx";
import {Http} from "../../services";
import {Account, NFT} from "../../interfaces";
import {CancelableTokens} from "../../services/mixins/cancel-tokens";
import {Constructor, EmptyClass} from "../../helpers/mixins";
import {Loadable} from "../../services/mixins/loadable";
import AppStore from "../../store/App.store";
import {isValidEthereumAddress} from "../../helpers/strings";
import {arrayMerge, getShallowEqualDiffKeys} from "../../helpers/arrays";
import {Scrollable} from "../../services/mixins/scrollable";

export enum Tabs {
    Collected = "collected",
    Minted = "minted"
}

class ProfileStore extends Loadable(CancelableTokens(Scrollable<NFT>(EmptyClass))) {

    queryUrl = "/nft"

    @observable
    selectedTab: Tabs = Tabs.Collected

    @observable
    isAccountValid = true

    @observable
    _account?: Account;

    @observable
    public addressOrDisplayName: string

    constructor(addressOrDisplayName: string, initialTab?: Tabs) {
        super()
        makeObservable(this)
        this._cancelable_tokens_construct("PROFILESTORE")
        this.addressOrDisplayName = addressOrDisplayName
        if (initialTab) {
            this.selectedTab = initialTab
        }
    }

    async init() {
        if (!this._account) {
            let address = this.addressOrDisplayName
            if (!isValidEthereumAddress(this.addressOrDisplayName)) {
                const {data} = await Http.guest.get<Account[]>("/account")
                const account = data.filter(account => account.displayName === this.addressOrDisplayName)[0]
                if (!account) {
                    this.isAccountValid = false
                    return
                } else {
                    address = account.address
                }
            }

            await Http.guest.get(`/account/${address}/ping`, {
                cancelToken: this.generate("PINGMYPING_" + this.addressOrDisplayName)
            }).then(({data}) => {
                this._account = data.account
                this.isAccountValid = true
            }).catch(e => {
                this.isAccountValid = false
            });
        }
        AppStore.events.subscribe(AppStore.events.events.GET_ACCOUNTS, this, "onNewAccountsDetected")
        return this.tapWithLoading(() => super.fresh())
    }

    fresh() {
        return this.tapWithLoading(() => super.fresh())
    }

    getQueryConfig() {
        let addressParam
        if (this.selectedTab === Tabs.Collected) {
            addressParam = {ownerAddress: this.account?.address}
        } else {
            addressParam = {creatorAddress: this.account?.address}
        }
        return {
            ...super.getQueryConfig(),
            params: {
                ...super.getQueryConfig().params,
                ...addressParam
            },
            cancelToken: this.generate("GET_NFT_" + this.selectedTab + this.addressOrDisplayName)
        }
    }

    @computed
    get account() {
        return this._account;
    }

    @computed
    get isAccountSyncing() {
        return this.account && !this.account.lastSyncedAt
    }

    @computed
    get displayName() {
        return this.account?.displayName ? this.account.displayName : "Unnamed"
    }

    onNewAccountsDetected(accounts: Account[]) {
        const account = accounts.filter(account => account.address === this.account?.address)[0]
        if (!account) {
            throw new Error("Account not found in accounts. Something wrong")
        }
        if (getShallowEqualDiffKeys(this._account, account).length > 0) {
            this._account = account
        }
    }

    destroy() {
        return AppStore.events.unsubscribeAllFrom(this)
    }
}


export default ProfileStore
