import {makeObservable, observable, toJS} from "mobx";
import AuthStore from "./Auth.store";
import ModalsStore from "./Modals.store";
import {Http} from "../services";
import {isMainnet, isTestnet} from "../environment/vars";
import {isLocalhost, isProduction} from "../environment/helpers";
import env from "../environment";
import {Account} from "../interfaces";
import {arrayFindByField} from "../helpers/arrays";
import EventsStore from "./Events.store";

export class _AppStore {

    @observable
    auth: AuthStore

    @observable
    modals: ModalsStore

    @observable
    events: EventsStore

    @observable
    finishedCriticalInit = false

    @observable
    isCriticalErrorHit = false

    @observable
    criticalErrorMessage: { message: string }[] = []

    @observable
    accounts: Account[] = []

    constructor() {
        makeObservable(this)
        this.auth = new AuthStore()
        this.modals = new ModalsStore()
        this.events = new EventsStore()
        //@ts-ignore
        window.__APP_STORE__ = this;
    }

    private turnOnMaintenanceMode(reason: string) {
        document.write("~~~ MAINTENANCE ~~~")
        alert("🚨 Service not available 🚨")
        console.error(reason);
        // TODO: add sentry logging
    }

    async handleNonCriticalInit() {
        try {
            if (!isLocalhost()) {
                // || isProduction() may be too restrictive in case of debugging etc, just isMainnet in that case may be enough
                if (isMainnet() || isProduction()) {
                    if (window.location.href.indexOf("rinkeby") >= 0) {
                        this.turnOnMaintenanceMode("mainnet env on rinkeby site");
                    }
                }
                // testnet deployment must have rinkeby in domain
                if (isTestnet()) {
                    if (window.location.href.indexOf("rinkeby") == -1) {
                        this.turnOnMaintenanceMode("testnet env on non-rinkeby site");
                    }
                }
            }
            Http.guest.get("/info").then((res) => {
                if (res.data.is_maintenance === "yes") {
                    this.turnOnMaintenanceMode("maintenance mode")
                }
                if (res.data.network_name !== env.network.name) {
                    this.turnOnMaintenanceMode("network mismatch")
                }
            }).catch((e) => {
                console.error(e);
                // this.turnOnMaintenanceMode();
            })
            this.getAccounts()
        } catch (e) {
            console.error(e);
            // this.turnOnMaintenanceMode();
        }
    }

    async init() {
        await this.auth.init()
        this.finishedCriticalInit = true
        this.handleNonCriticalInit()
    }

    getAccounts() {
        return Http.guest.get("/account").then(({data}) => {
            this.accounts = data
            this.events.publish(this.events.events.GET_ACCOUNTS, toJS(this.accounts))
        })
    }

    getAccountByAddressFromCache(address: string) {
        return arrayFindByField(this.accounts, address, 'address');
    }
}

const AppStore = new _AppStore()
export default AppStore
