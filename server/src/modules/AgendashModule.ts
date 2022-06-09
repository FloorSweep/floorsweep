import {AfterRoutesInit, Inject, PlatformApplication} from "@tsed/common";
import {Configuration, Module} from "@tsed/di";
import {Agenda} from "agenda";
import {isProduction} from "../environment/helpers";

const Agendash = require("agendash");
const basicAuth = require('express-basic-auth');

@Module()
export class AgendashModule implements AfterRoutesInit {
    @Configuration()
    config: Configuration;

    @Inject()
    agenda: Agenda;

    @Inject()
    app: PlatformApplication;

    $afterRoutesInit() {
        if (this.config.agenda?.enabled && !isProduction()) {
            this.app.use("/agendash",
                basicAuth({
                    users: {
                        admin: process.env.AGENDASH_PW,
                    },
                    challenge: true,
                }),
                Agendash(this.agenda));
        }
    }
}
