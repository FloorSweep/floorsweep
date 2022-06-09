import {Constructor, guardMixinClassInheritance} from "../../helpers/mixins";
import {makeObservable, observable} from "mobx";

export function Loadable<T extends Constructor>(Base1: T) {
    /**
     * Loadable
     *
     * Description:
     * Provides isLoading state to class and helper function for triggering it based on async load
     */
    class Loadable extends Base1 {
        @observable
        isLoading = true;

        protected tapWithLoading(func: () => Promise<any>) {
            this.isLoading = true;
            const ret = func();
            Promise.all([ret]).finally(() => {
                this.isLoading = false;
            })
            return ret;
            // return func()
            //   .finally(() => {
            //     this.isLoading = false;
            //   })
        }
    }

    guardMixinClassInheritance(Loadable, Base1);
    return Loadable;
}
