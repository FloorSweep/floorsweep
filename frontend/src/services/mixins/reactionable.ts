import {IReactionDisposer, IReactionOptions, IReactionPublic, reaction} from "mobx";
import {Constructor, EmptyClass, guardMixinClassInheritance} from "../../helpers/mixins";
import {debugToast} from "../../components/Toast/Toast";

export function Reactionable<T extends Constructor>(Base1: T) {
  const Reactionable = class extends Base1 {
    private autoDispose: IReactionDisposer[] = [];

    react<T>(expression: (r: IReactionPublic) => T, effect: (arg: T, r: IReactionPublic) => void, opts?: IReactionOptions<any, any>) {
      // @ts-ignore
      this.autoDispose.push(reaction(expression, effect, opts));
    }

    disposeReactions() {
      if (this.autoDispose && this.autoDispose.length) {
        //@ts-ignore
        debugToast(this.constructor.name + " -- dispose_reactions", 5000);
        this.autoDispose.map((reaction: any) => reaction());
        this.autoDispose = [];
      }
    }

  }
  guardMixinClassInheritance(Reactionable, Base1);
  return Reactionable;
}

export default abstract class ReactionsStore extends Reactionable(EmptyClass) {

}
