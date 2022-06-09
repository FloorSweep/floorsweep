import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";
import env from "./environment";

if (env.sentry.dsn) {
    console.log("[sentry] connecting sentry!");
    Sentry.init({
        dsn: env.sentry.dsn,
        integrations: [new BrowserTracing()],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
}else{
    console.log("[sentry] skipping sentry...");
}
const exports = {}
export default exports
