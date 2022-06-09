import {action, computed, makeObservable, observable} from "mobx";
import {LikeEnsNameDocument} from "../../generated/graphql";
import apolloClient from "../../services/apollo";
import {Http} from "../../services";
import {NFT} from "../../interfaces";
import {EmptyClass} from "../../helpers/mixins";
import {Reactionable} from "../../services/mixins/reactionable";
import {Loadable} from "../../services/mixins/loadable";
import {CancelableTokens} from "../../services/mixins/cancel-tokens";
import {debounce} from "lodash";

class HomeSearchStore extends Reactionable(CancelableTokens(Loadable(EmptyClass))) {

    @observable
    searchValue = ""

    @observable
    isTypeAheadVisible = false

    @observable
    ensFilterResults: { address: string, name: string }[] = []

    @observable
    metadataNameResults: { id: number, name: string }[] = []

    private maxCountResults = 4

    constructor() {
        super()
        makeObservable(this)
        this._cancelable_tokens_construct('HOMESEARCHSTORE');
    }

    init() {
        return this.react(() => this.searchValue, debounce((value) => {
            if (value !== "" && value.length >= 3) {
                this.isTypeAheadVisible = true
                return this.tapWithLoading(async () => {
                    return this.query(value)
                })
            } else {
                this.isTypeAheadVisible = false
                this.ensFilterResults = []
                this.metadataNameResults = []
            }
        }, 500), {fireImmediately: false})
    }

    @computed
    get isSearchResultsEmpty() {
        return this.ensFilterResults.length === 0 && this.metadataNameResults.length === 0
    }

    queryEns(name: string) {
        return apolloClient.query({
            query: LikeEnsNameDocument,
            variables: {name}
        })
    }

    queryNftByName(name: string) {
        return Http.guest.get<NFT[]>("/nft", {
            cancelToken: this.generate(`nftNameQuery`),
            params: {name}
        })
    }

    async query(value: string) {
        const [ens, metadataByName] = await Promise.all([this.queryEns(value), this.queryNftByName(value)])

        this.ensFilterResults = ens.data.domains.map((domain: any) => ({
            name: domain.name,
            address: domain.resolvedAddress.id
        })).slice(0, this.maxCountResults)
        //@ts-ignore
        this.metadataNameResults = metadataByName.data.data.map(nft => ({
            name: nft.name,
            id: nft.tokenId
        })).slice(0, this.maxCountResults)
    }

    destroy() {
        return super.disposeReactions()
    }

    @action
    reset() {
        this.searchValue = ""
        this.isTypeAheadVisible = false
    }
}

export default HomeSearchStore
