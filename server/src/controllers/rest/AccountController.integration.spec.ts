import {PlatformTest} from "@tsed/common";
import SuperTest from "supertest";
import {AccountController} from "./AccountController";
import {Server} from "../../Server";
import {createRandomUser, getApiAuthHeaders} from "../../__tests__/helpers";
import {ethers} from "ethers";

describe("AccountController", () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;
    jest.setTimeout(10 * 1000);
    beforeEach(PlatformTest.bootstrap(Server, {
        mount: {
            "/": [AccountController]
        }
    }));
    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(PlatformTest.reset);

    it("should create new user", async () => {
        await createRandomUser(request)
        expect(true).toEqual(true);
    });

    it("should update a user", async () => {
        const {wallet} = await createRandomUser(request)
        const body = {
            displayName: "gainormather",
            email: "gainormather@gmail.com",
            description: "heybaby",
            websiteUrl: "https://town.neocities.org/"
        }
        const {body: updatedUser} = await request
            .post("/account/update")
            .set(await getApiAuthHeaders(wallet, body))
            .send(body)
            .expect(200)

        expect(updatedUser.address).toEqual(wallet.address)
    });

    it("should update the user then return nullable keys to null", async () => {
        const {wallet} = await createRandomUser(request)
        const body = {
            displayName: null,
            description: null,
            websiteUrl: null
        }
        const {body: moreUpdateUser} = await request
            .post("/account/update")
            .set(await getApiAuthHeaders(wallet, body))
            .send(body)
            .expect(200)
        expect(moreUpdateUser.displayName).toEqual(null)
        expect(moreUpdateUser.description).toEqual(null)
        expect(moreUpdateUser.websiteUrl).toEqual(null)
    })

    it("should call GET /account", async () => {
        const {wallet, account} = await createRandomUser(request)
        const {body} = await request.get(`/account/${account.address}/status`)
            .set(await getApiAuthHeaders(wallet, {}))
            .expect(200);
        expect(body.account.id).toEqual(account.id);
    });

    it("should call GET /address and fail due to missing auth headers", async () => {
        const {wallet} = await createRandomUser(request)
        await request
            .get(`/account/${wallet.address}/status`)
            .expect(401)
    });

    it("should fail creating new user", async () => {
        const wallet = ethers.Wallet.createRandom()
        const address = wallet.address
        const displayName = "test-user-" + Math.random();
        const email = displayName + "@test.com";
        const body = {
            email,
            displayName,
            address,
            whatever: "test"
        }
        await request
            .post("/account/signup")
            .set(await getApiAuthHeaders(wallet, body))
            .send(body)
            .expect(400);
    })

    it("should fail attempting to update address", async() => {
        const {wallet} = await createRandomUser(request)
        const body = {address: "yeahbaby"}
        await request
            .post("/account/update")
            .set(await getApiAuthHeaders(wallet, body))
            .send(body)
            .expect(400)
    })

    it("should fail attempting to post non-uri to website_url", async () => {
        const {wallet} = await createRandomUser(request)
        const body = {websiteUrl: "not a website!!"}
        await request
            .post("/account/update")
            .set(await getApiAuthHeaders(wallet, body))
            .send(body)
            .expect(400)
    })

    it("should fail attempting to post non-email", async() => {
        const {wallet} = await createRandomUser(request)
        const body = {
            email: "notanemail!"
        }
        await request
            .post("/account/update")
            .set(await getApiAuthHeaders(wallet, body))
            .send(body)
            .expect(400)
    })

    it("should trim whitespace from email, displayName, and websiteUrl", async () => {
        const {wallet} = await createRandomUser(request)
        const displayName = "hahaha"
        const websiteUrl = "https://test.com"
        const email = "test@me.com"
        const body = {
            displayName: displayName + "       ",
            websiteUrl: " " + websiteUrl,
            email: "  " + email + "                 "
        }
        const {body: reqBody} = await request
            .post("/account/update")
            .set(await getApiAuthHeaders(wallet, body))
            .send(body)
            .expect(200)
        console.log('debug:: req body', reqBody)
        expect(reqBody.displayName).toEqual(displayName)
        expect(reqBody.websiteUrl).toEqual(websiteUrl)
    })
});
