import {Eventable} from "../services/mixins/eventable";
import {EmptyClass} from "../helpers/mixins";

class EventsStore extends Eventable(EmptyClass){
    readonly events = {
        GET_ACCOUNTS: "GET_ACCOUNTS"
    }
}

export default EventsStore
