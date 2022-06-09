import {Constructor} from "../../helpers/mixins";
import {computed, makeObservable, observable} from "mobx";
import {arrayMerge} from "../../helpers/arrays";
import {Http} from "../index";

export function Scrollable<K, T extends Constructor = Constructor>(Base1: T) {
    abstract class Pageable extends Base1 {

        @observable
        cursor?: number

        @observable
        data: K[] = []

        protected abstract queryUrl: string
        protected pageSize = 20
        protected httpClient = Http.guest

        protected constructor(...rest: any[]) {
            super()
            makeObservable(this)
        }

        protected getQueryConfig() {
            return {
                params: {
                    pageSize: this.pageSize,
                    cursor: this.cursor ? this.cursor : undefined
                }
            }
        }

        private query() {
            return this.httpClient.get<{data: K[], cursor?: number}>(this.queryUrl, this.getQueryConfig())
        }

        public fresh() {
            return this.query().then((res) => {
                this.data = res.data.data
                this.cursor = res.data.cursor
                return res
            })
        }

        public next() {
            if (!this.cursor) {
                return
            }
            return this.query().then((res) => {
                this.data = arrayMerge(this.data, res.data.data)
                this.cursor = res.data.cursor
                return res
            })
        }

        @computed
        get dataLength() {
            return this.data.length
        }

        @computed
        get hasData() {
            return this.dataLength > 0
        }

        @computed
        get hasMore() {
            return !!this.cursor
        }
    }
    return Pageable
}
