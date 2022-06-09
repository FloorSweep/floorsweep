import {join} from "path";
import {Configuration, Inject} from "@tsed/di";
import "@tsed/platform-express"; // /!\ keep this import
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import "@tsed/ajv";
import "@tsed/swagger";
import {config} from "./config";
import * as rest from "./controllers/rest";
import * as pages from "./controllers/pages";
import {memoryStorage} from "multer";
import {AgendashModule} from "./modules/AgendashModule";
import {AgendaModule} from "@tsed/agenda";
import {SyncJobService} from "./services/SyncJobService";
import {ZZApp} from "./services/ZZApp";
import {PlatformMiddlewareSettings} from "@tsed/platform-middlewares/lib/types/domain/PlatformMiddlewareSettings";
import {ErrorExceptionFilter} from "./filters/ErrorExceptionFilter";

const middlewares: PlatformMiddlewareSettings[] = [
    cookieParser(),
    compress({}),
    methodOverride(),
    bodyParser.json(),
    bodyParser.urlencoded({
        extended: true
    })
];
if (process.env.APP_ENV === "localhost") {
    middlewares.unshift(cors());
}

@Configuration({
    ...config,
    acceptMimes: ["application/json"],
    debug: true,
    agenda: {
        enabled: true,
        // pass any options that you would normally pass to new Agenda(), e.g.
        db: {
            address: process.env.ZZ_MONGO_ADDRESS + "agenda",
            options: {
                authSource: 'admin',
                auth: {
                    username: process.env.ZZ_MONGO_USER,
                    password: process.env.ZZ_MONGO_PW,
                },
            },
        },
    },
    cache: {
        ttl: 300, // default TTL
        store: "memory"
        // options options depending on the choosen storage type
    },
    multer: {
        // TODO: memory concerns w storing file in memory??
        storage: memoryStorage(),
        limits: {fileSize: 1e8} // 100 MB max file size
    },
    httpPort: process.env.PORT,
    httpsPort: false, // CHANGE
    componentsScan: [
        `./services/**/**.ts`,
        `./middlewares/**/**.ts`,
        `./modules/**/**.ts`,
        `./decorators/**/**.ts`,
        `./pipes/**/**.ts`,
        `./schemas/**/**.ts`,
        `./filters/**/**.ts`,
    ],
    imports: [
        AgendaModule,
        AgendashModule,
        SyncJobService,
        ErrorExceptionFilter
    ],
    mount: {
        "/": [
            ...Object.values(rest)
        ],
        "/static": [
            ...Object.values(pages)
        ]
    },
    middlewares: middlewares,
    views: {
        root: join(process.cwd(), "../views"),
        extensions: {
            ejs: "ejs"
        }
    },
    exclude: [
        "**/*.spec.ts"
    ]
})
export class Server {
    @Inject()
    protected app: ZZApp;

    @Configuration()
    protected settings: Configuration;

}
