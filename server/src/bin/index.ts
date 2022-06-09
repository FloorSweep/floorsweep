#!/usr/bin/env node
import {CliCore} from "@tsed/cli-core";
import {config} from "../config";
import {HelloCommand} from "./HelloCommand";
import {ResyncCommand} from "./ResyncCommand";
import {SyncJobService} from "../services/SyncJobService";
import {AgendaModule} from "@tsed/agenda";
import {AgendaWorkerCommand} from "./AgendaWorkerCommand";
import {ZkWebsocketCommand} from "./ZkWebsocketCommand";
import '../sentry';

CliCore.bootstrap({
    ...config,
    imports: [
        AgendaModule,
        SyncJobService
    ],
    agenda: {
        enabled: false,
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
    commands: [
      ZkWebsocketCommand,
        AgendaWorkerCommand,
        ResyncCommand,
        HelloCommand
    ]
}).catch(console.error);
