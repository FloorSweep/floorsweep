import {Unauthorized} from "@tsed/exceptions";

export default class UserNotFoundError extends Unauthorized {
    constructor() {
        super("User not found");
    }
}