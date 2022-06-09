import {Middleware, MiddlewareMethods} from "@tsed/platform-middlewares";
import {Context} from "@tsed/platform-params";
import {AuthMiddleware} from "./AuthMiddleware";
import {Req} from "@tsed/common";
import {requiredAuthHeaderKeys, CURRENT_ACCOUNT_CONTEXT_KEY, CURRENT_SIGNING_ADDRESS_CONTEXT_KEY} from "./constants";
import {objectKeys} from "../../helpers/arrays";

@Middleware()
export class MaybeAuthMiddleware extends AuthMiddleware {
    protected hasAnyAuthHeaders(req: Req) {
        const keys = objectKeys(requiredAuthHeaderKeys);
        for (let i = 0; i < keys.length; ++i) {
            if (req.header(keys[i])) {
                return true;
            }
        }
        return false;
    }

    public async use(@Req() request: Req, @Context() ctx: Context) {
        if (this.hasAnyAuthHeaders(request)) {
            return super.use(request, ctx);
        }else{
            ctx.set(CURRENT_ACCOUNT_CONTEXT_KEY, null)
            ctx.set(CURRENT_SIGNING_ADDRESS_CONTEXT_KEY, null)
        }
    }
}
