import {Middleware, MiddlewareMethods} from "@tsed/platform-middlewares";
import {Context} from "@tsed/platform-params";
import {
    AuthHeaders,
    CURRENT_SIGNING_ADDRESS_CONTEXT_KEY,
    optionalAuthHeaderKeys,
    requiredAuthHeaderKeys
} from "./constants";
import {BadRequest, Unauthorized} from "@tsed/exceptions";
import {Logger, Req} from "@tsed/common";
import {objectKeys} from "../../helpers/arrays";
import {FILE_UPLOAD_KEY} from "../../config/multer";
import {Inject} from "@tsed/di";
import {ethers} from "ethers";
import {isAddressesEqual} from "../../helpers/strings";

@Middleware()
export class VerifySignatureMiddleware implements MiddlewareMethods {
    @Inject()
    protected logger: Logger

    private verifySignatureTimestamp(timestamp: string) {
        const msInSeconds = 1000
        const nowSeconds = new Date().getTime() / msInSeconds
        const timestampSeconds = new Date(timestamp).getTime() / msInSeconds
        const fullDaySeconds = 60 * 60 * 24
        return (nowSeconds - timestampSeconds) < fullDaySeconds
    }

    private verifySignature(payload: object, address: string, timestamp: string, signature: string, humanMessage?: string) {
        if (!this.verifySignatureTimestamp(timestamp)) {
            // TODO: add logging for invalid timestamp
            return false;
        }
        let message = JSON.stringify(payload) + "_" + timestamp
        if (humanMessage) {
            message = `${humanMessage}\n\n` + message
        }
        const signingAddress = ethers.utils.verifyMessage(message, signature)
        return isAddressesEqual(address, signingAddress);
    }

    protected getHeaderValues(req: Req) {
        const headers: AuthHeaders = {} as AuthHeaders
        objectKeys(requiredAuthHeaderKeys).forEach(key => {
            const headerValue = req.header(requiredAuthHeaderKeys[key])
            if (!headerValue) {
                throw new Unauthorized(`Missing header: ${requiredAuthHeaderKeys[key]}`)
            } else {
                headers[key] = headerValue
            }
        })
        objectKeys(optionalAuthHeaderKeys).forEach(key => {
            const value = req.header(optionalAuthHeaderKeys[key])
            if (value) {
                headers[key] = value
            }
        })
        return headers
    }

    protected getSignerAddress(req: Req, {timestamp, address, signature, humanMessage}: AuthHeaders) {
        let payload

        if (req.method === "POST" || req.method === "DELETE") {
            payload = req.body || {}
        } else if (req.method === "GET") {
            payload = req.query || {}
        } else {
            throw new Error("Request type not supported")
        }

        // TODO: @partyka how would you like to proceed here? signing file names & size maybe??
        // TODO: order here with file and other data is a possible issue
        if (req.files) {
            if (FILE_UPLOAD_KEY in req.files) {
                if (req.files[FILE_UPLOAD_KEY].length > 1) {
                    throw new Error("Only single file attachments are allowed")
                }
                payload[FILE_UPLOAD_KEY] = req.files[FILE_UPLOAD_KEY][0].originalname
            } else {
                throw new Error(`File uploads must be attached with: ${FILE_UPLOAD_KEY} key name`)
            }
        }

        if (!this.verifySignature(payload, address, timestamp, signature, humanMessage)) {
            // TODO: throw code=401
            throw new Error("Signature invalid")
        }
        return {
            signingAddress: address
        }
    }


    async use(@Req() request: Req, @Context() ctx: Context) {

        const headers = this.getHeaderValues(request);

        try {
            const {signingAddress} = this.getSignerAddress(request, headers)
            ctx.set(CURRENT_SIGNING_ADDRESS_CONTEXT_KEY, signingAddress)
        } catch (e) {
            throw new BadRequest(e.message)
        }
    }
}
