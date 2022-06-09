import './datadog';
import './sentry';
import {$log} from "@tsed/common";
import {PlatformExpress} from "@tsed/platform-express";
import {Server} from "./Server";
import {objectKeys} from "./helpers/arrays";

async function bootstrap() {
    try {
        // check envs
        const test = {
            ZZ_MONGO_USER: process.env.ZZ_MONGO_USER,
            ZZ_MONGO_PW: process.env.ZZ_MONGO_PW,
            ZZ_MONGO_ADDRESS: process.env.ZZ_MONGO_ADDRESS,
            ZZ_PG_URL: process.env.ZZ_PG_URL,
            PINATA_KEY: process.env.PINATA_KEY,
            PINATA_SECRET: process.env.PINATA_SECRET,
            PINATA_JWT: process.env.PINATA_JWT,
        };
        objectKeys(test).forEach((key) => {
            console.log(`Checking env ${key}...`)
            if (!test[key]) {
                throw new Error("Error! Missing env: " + key);
            }
        });
        const platform = await PlatformExpress.bootstrap(Server);
        await platform.listen();
        // console.log(platform.app);
        process.on("SIGINT", () => {
            platform.stop();
        });
    } catch (error) {
        $log.error({event: "SERVER_BOOTSTRAP_ERROR", error});
    }
}

bootstrap();
