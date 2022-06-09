import {PlatformTest} from "@tsed/common";
import SuperTest from "supertest";
import {Server} from "./Server";


describe("Server", () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;

    beforeEach(PlatformTest.bootstrap(Server));
    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(PlatformTest.reset);

    it("should call GET /", async () => {
        const response = await request.get("/").expect(404);

        expect(response.body).toEqual({
            errors: [],
            message: 'Resource "/" not found',
            name: "NOT_FOUND",
            status: 404,
        });
    });
});
