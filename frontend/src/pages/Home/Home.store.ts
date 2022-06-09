import {computed, makeObservable, observable} from "mobx";
import {NFT} from "../../interfaces";
import {Loadable} from "../../services/mixins/loadable";
import {EmptyClass} from "../../helpers/mixins";
import {CancelableTokens} from "../../services/mixins/cancel-tokens";
import LocalStorage from "../../services/local-storage";
import {Scrollable} from "../../services/mixins/scrollable";


class HomeStore extends CancelableTokens(Loadable(Scrollable<NFT>(EmptyClass))) {

    queryUrl = "/nft"

    @observable
    feed: NFT[] = []

    constructor() {
        super()
        makeObservable(this)
        this._cancelable_tokens_construct("HOMESTORE")
    }

    getQueryConfig() {
        return {
            ...super.getQueryConfig(),
            cancelToken: this.generate("getNfts")
        }
    }

    async init() {
        return this.tapWithLoading(() => super.fresh())
    }
}

export default HomeStore