import {computed, makeObservable, observable} from "mobx";
import {Http} from "../services";
import {Account, Order} from "../interfaces";
import ZKWalletStore from "./ZKWallet.store";
import {ethers} from "ethers";
import {abbreviate, isValidEthereumAddress, jsonify} from "../helpers/strings";
import AppStore from "./App.store";
import {debugToast} from "../components/Toast/Toast";
import UserNotFoundError from "../services/exceptions/UserNotFound.error";
import {CancelableTokens} from "../services/mixins/cancel-tokens";
import env from "../environment";

class AuthStore extends CancelableTokens(ZKWalletStore) {

    @observable
    account: Account | null = null

    @observable
    orders: Order[] = []

    @observable
    isAuthLoading = false;

    constructor() {
        super()
        makeObservable(this)
        this._cancelable_tokens_construct("AUTHSTORE")
    }

    async getUserOrders() {
        // TODO: think more about this
        if (AppStore.auth.account?.address) {
            const address = AppStore.auth.account.address
            const {data} = await Http.guest.get<Order[]>("/order", {
                cancelToken: this.generate(`userOrders:${address}`),
                params: {ownerAddress: address}
            })
            this.orders = data
        }
    }

    private async getAccount() {
        const address = await this.wallet?.address()
        const {data} = await Http.authed.get(`/account/${address}/status`, {
            cancelToken: this.generate(`accountStatus:${address}`),
            signerHumanMessage: `Sign into your ${env.app.name} account`
        })
        this.account = data.account
        console.log("debug:: account", jsonify(this.account))
    }

    private async signUp() {
        const address = this.wallet?.address()
        const body = {}
        const {data} = await Http.authed.post("/account/signup", body, {
            cancelToken: this.generate(`signUp:${address}`),
            signerHumanMessage: `Signup for ${env.app.name}`
        })
        this.account = data
        AppStore.getAccounts()
    }

    async connect(signer: ethers.Signer) {
        console.log("auth::connect [start]")
        console.log({signer})
        this.isAuthLoading = true

        try {
            try {
                await super.connect(signer)
            } catch (e) {
                console.error("Could not get signer");
                if ((e as any).reason === "underlying network changed") {
                    // reloads triggers getZkWallet() popups onload with now proper network injected
                    window.location.reload();

                    return;
                    // currently we support auto connect only for metamask, bc it's not obvious if for other
                    // providers there are no diffs in implementations etc need to test all of them
                    //@ts-ignore
                    if (signer.provider.connection.url === "metamask") {
                        // window.location.hash = "connect=metamask"
                        window.location.reload();
                    }
                }
                throw e
            }

            try {
                await this.getAccount()
            } catch (e) {
                if (e instanceof UserNotFoundError) {
                    debugToast("User is not authed. Signing up")
                    try {
                        await this.signUp()
                    } catch (e) {
                        debugToast("Could not sign up user")
                        console.error("Could not sign up user");
                    }
                } else {
                    console.error("Could not get account");
                    throw e
                }
            }
        } finally {
            this.isAuthLoading = false
        }

        await this.getUserOrders()
        await this.getUserZkSyncBalances()
    }

    logout() {
        super.disconnect()
        this.account = null
        this.wallet = null
    }

    get isAuthed() {
        return this.account!! && this.wallet!!
    }

    @computed
    get displayName() {
        if (this.isAuthed) {
            if (this.account!.displayName) {
                const displayName = this.account!.displayName
                return isValidEthereumAddress(displayName) ? abbreviate(displayName) : displayName
            } else {
                return abbreviate(this.account!.address)
            }
        } else {
            return ""
        }
    }

    @computed
    get hasOrders() {
        return this.orders.length > 0
    }

    @computed
    get accountId() {
        return this.account?.id;
    }

    updateAccount(body: any) {
        return Http.authed.post("/account/update", body, {
            signerHumanMessage: "Update account"
        }).then(({data}) => {
            this.account = data
            AppStore.getAccounts()
        })
    }
}

export default AuthStore
