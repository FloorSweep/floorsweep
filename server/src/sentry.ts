const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

let dsn = process.env.SENTRY_DSN
if (dsn) {
    console.log("[sentry] connecting sentry!");
    Sentry.init({
        dsn,
        debug: true,
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
} else {
    console.log("[sentry] skipping sentry...");
}
