export function isTest() {
    return process.env.APP_ENV === "test";
}

export function isLocalhost() {
    return process.env.APP_ENV === "localhost";
}

export function isStaging() {
    return process.env.APP_ENV === "staging";
}

export function isProduction() {
    return process.env.APP_ENV === "production";
}
