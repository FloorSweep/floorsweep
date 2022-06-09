import {Controller, Inject} from "@tsed/di";
import {Get, Post} from "@tsed/schema";
import {BodyParams, Context, PathParams} from "@tsed/platform-params";
import {Logger} from "@tsed/logger";
import {UseAuth, UseBefore} from "@tsed/platform-middlewares";
import {CURRENT_ACCOUNT_CONTEXT_KEY, CURRENT_SIGNING_ADDRESS_CONTEXT_KEY} from "../../middlewares/auth/constants";
import {AuthMiddleware} from "../../middlewares/auth/AuthMiddleware";
import {ZZApp} from "../../services/ZZApp";
import {AccountsRepository} from "../../services/AccountsRepository";
import {Account} from "../../../prisma/generated/prisma";
import {VerifySignatureMiddleware} from "../../middlewares/auth/VerifySignatureMiddleware";
import {UseJoiSchema} from "../../decorators/UseJoiSchema";
import {UpdateAccountParams} from "../../interfaces/generated";
import {UpdateAccountParamsSchema} from "../../schemas/UpdateAccountParamsSchema";
import {BadRequest, Unauthorized} from "@tsed/exceptions";
import {GuestMiddleware} from "../../middlewares/auth/GuestMiddleware";
import {MaybeAuthMiddleware} from "../../middlewares/auth/MaybeAuthMiddleware";
import {isValidEthereumAddress} from "../../helpers/strings";
import {ZkSyncService} from "../../services/ZkSyncService";

@Controller("/account")
export class AccountController {
    @Inject()
    private accounts: AccountsRepository;

    @Inject()
    private app: ZZApp;

    @Inject()
    private logger: Logger

    @Inject()
    private zk: ZkSyncService

    @Get("/")
    @UseAuth(GuestMiddleware)
    async getAccounts() {
        return this.accounts.findMany({
            select: {
                id: true,
                displayName: true,
                address: true,
                websiteUrl: true,
                description: true
            }
        })
    }

    @Get("/:address/ping")
    @UseAuth(MaybeAuthMiddleware)
    async pingIt(@PathParams("address") address: string) {
        if (!isValidEthereumAddress(address)) {
            throw new BadRequest("Invalid address")
        }
        let account = await this.accounts.getByAddress(address)
        if (account) {
            // Schedule a sync if it was last refreshed > 60m
            if (!account.lastSyncedAt || (new Date().getTime() - new Date(account.lastSyncedAt).getTime()) / 1000 > 60 * 60) {
                await this.app.maybeResyncAddress(address);
            }
        } else if (!account) {
            account = await this.accounts.signup(address);
        }
        return {account}
    }

    @Post("/signup")
    @UseAuth(VerifySignatureMiddleware)
    async signup(
        @BodyParams()
        @UseJoiSchema(UpdateAccountParamsSchema) data: UpdateAccountParams,
        @Context(CURRENT_SIGNING_ADDRESS_CONTEXT_KEY) address: string
    ) {
        return this.accounts.signup(address, data);
    }

    @Post("/update")
    @UseAuth(AuthMiddleware)
    async updateAccount(
        @BodyParams()
        @UseJoiSchema(UpdateAccountParamsSchema) data: UpdateAccountParams,
        @Context(CURRENT_SIGNING_ADDRESS_CONTEXT_KEY) address: string
    ) {
        return this.accounts.updateAccount(address, data);
    }

    @Post("/resync")
    @UseAuth(AuthMiddleware)
    async resyncAccount(
        @Context(CURRENT_SIGNING_ADDRESS_CONTEXT_KEY) address: string
    ) {
        await this.app.maybeResyncAddress(address);
        return {status: "ok"}
    }


    /**
     *
     *
     *
     *
     * KEEP THE CATCH ALL ON THE END!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!111111111
     *
     *
     *
     *
     */


    @Get("/:address/status")
    @UseAuth(AuthMiddleware)
    async getByAddress(@PathParams("address") address: string,
                       @Context(CURRENT_ACCOUNT_CONTEXT_KEY) loggedInAccount: Account) {
        if (loggedInAccount.address !== address) {
            throw new Unauthorized("Not authorized");
        }
        const account = await this.accounts.findFirst({where: {address}})
        console.log("debug:: account", account)
        // await this.app.maybeResyncAddressIfStale(address);
        return {
            account
        }
    }

}
