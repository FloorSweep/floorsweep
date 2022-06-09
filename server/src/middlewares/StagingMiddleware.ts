import {Middleware, MiddlewareMethods} from "@tsed/platform-middlewares";
import {Context} from "@tsed/platform-params";
import {Forbidden} from "@tsed/exceptions";

@Middleware()
export class StagingMiddleware implements MiddlewareMethods {
    use(@Context() ctx: Context) {
        if (['local', 'localhost', 'staging'].indexOf(process.env.APP_ENV!) == -1) {
            throw new Forbidden("Not available");
        }
    }
}
