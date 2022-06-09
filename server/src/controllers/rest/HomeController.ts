import {Controller, Inject} from "@tsed/di";
import {Get} from "@tsed/schema";
import {ZZApp} from "../../services/ZZApp";

@Controller("/")
export class HomeController {
    @Inject()
    app: ZZApp;

    @Get("/info")
    getInfo() {
        const info: any = {
            status: "ok",
            env: process.env.APP_ENV + "",
            version: process.env.BUILD_ID ? process.env.BUILD_ID : "n/a",
            network_name: this.app.getNetworkName()
        };
        if (process.env.MAINTENANCE_MODE === "yes") {
            info.is_maintenance = "yes"
        }
        return info;
    }
}
