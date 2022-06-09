import {Command, CommandProvider, QuestionOptions} from "@tsed/cli-core";
import {Agenda, Job} from "agenda";
import {JobPriority} from "agenda/dist/agenda/define";
import {Inject} from "@tsed/di";
import {SyncJobService} from "../services/SyncJobService";
import {ZZApp} from "../services/ZZApp";
import {ZkSyncService} from "../services/ZkSyncService";
import {Logger} from "@tsed/logger";
import {NftsRepository} from "../services/NftsRepository";
import {AccountsRepository} from "../services/AccountsRepository";
import {isProduction, isTest} from "../environment/helpers";


export abstract class Agendable {

    protected agenda: Agenda;

    protected async initAgenda() {

        this.agenda = new Agenda({
            db: {
                address: process.env.ZZ_MONGO_ADDRESS + "agenda",
                options: {
                    authSource: 'admin',
                    auth: {
                        username: process.env.ZZ_MONGO_USER,
                        password: process.env.ZZ_MONGO_PW,
                    },
                }
            }
        });
        await this.agenda.start();
        console.log("agenda initialized");
    }
}
