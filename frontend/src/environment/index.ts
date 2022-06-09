import development from "./development";
import production from "./production";
import staging from "./staging";
import {isDev, isProduction, isStaging} from "./helpers";

interface Environment {
    name: string;
    api: {
        baseURL: string;
        proxyURL?: string | null;
    }
    app: {
        name: string;
    }
    sentry: {
        dsn: string | null;
    }
    network: {
        id: number;
        name: string;
        infuraId: string;
        explorerUrl: string;
    }
}

let env: Environment
if (isProduction()) {
    env = production
} else if (isDev()) {
    env = development
} else if (isStaging()) {
    env = staging
} else {
    throw Error("Could not find correct environment")
}
console.log("selected env: " + env.name);

export {
    env as default
}


