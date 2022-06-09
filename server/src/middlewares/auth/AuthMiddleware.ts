import {Middleware} from "@tsed/platform-middlewares";
import {Context} from "@tsed/platform-params";
import {Req} from "@tsed/common";
import {BadRequest} from "@tsed/exceptions";
import {Inject} from "@tsed/di";
import {AccountsRepository} from "../../../prisma/generated/tsed";
import {CURRENT_ACCOUNT_CONTEXT_KEY, CURRENT_SIGNING_ADDRESS_CONTEXT_KEY} from "./constants";
import {ZkSyncService} from "../../services/ZkSyncService";
import {ZZApp} from "../../services/ZZApp";
import {VerifySignatureMiddleware} from "./VerifySignatureMiddleware";
import {isTest} from "../../environment/helpers";
import UserNotFoundError from "../../exceptions/UserNotFoundError";

@Middleware()
export class AuthMiddleware extends VerifySignatureMiddleware {
    @Inject()
    private accounts: AccountsRepository
    @Inject()
    private zk: ZkSyncService

    @Inject()
    private app: ZZApp;

    public async use(@Req() request: Req, @Context() ctx: Context) {
        const headers = this.getHeaderValues(request);

        try {
            const {signingAddress} = this.getSignerAddress(request, headers)
            const account = await this.accounts.findFirst({
                where: {address: signingAddress}
            })
            if (!account) {
                throw new UserNotFoundError();
            }
            // TODO: https://tsed.io/docs/testing.html#stub-a-middleware-method
            //  stub this instead of direct check here
            if (!isTest() && !await this.zk.isZkEnabled(signingAddress)) {
                throw new Error("Account is not zkSync enabled. Please set your signing key")
            }

            ctx.set(CURRENT_ACCOUNT_CONTEXT_KEY, account)
            ctx.set(CURRENT_SIGNING_ADDRESS_CONTEXT_KEY, signingAddress)
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                throw e
            }
            throw new BadRequest(e.message)
        }
    }
}
