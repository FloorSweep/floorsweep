import {PlatformTest} from "@tsed/common";
import SuperTest from "supertest";
import {HomeController} from "./HomeController";
import {Server} from "../../Server";

describe("HomeController", () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;

    beforeEach(PlatformTest.bootstrap(Server, {
        mount: {
            "/": [HomeController]
        }
    }));
    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(PlatformTest.reset);

    it("should call GET /", async () => {
        const response = await request.get("/info").expect(200);
        const body = response.body
        expect(body.status).toEqual("ok")
        expect(body.env).toEqual("test")
        expect(body.network_name).toEqual("rinkeby");
    });
});
