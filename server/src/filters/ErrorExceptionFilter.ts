import {BaseContext} from "@tsed/di";
import {Catch, ErrorFilter} from "@tsed/platform-exceptions";
import {Exception} from "@tsed/exceptions";

const Sentry = require('@sentry/node');

@Catch(Error)
export class ErrorExceptionFilter extends ErrorFilter {
    catch(error: Exception, ctx: BaseContext) {
        try {
            console.log("trying sentry...");
            Sentry.captureException(error);
        } catch (e) {
            console.error(e);
        }
        return super.catch(error, ctx);
    }
}
