import {PlatformTest} from "@tsed/common";
import SuperTest from "supertest";
import {Server} from "../../Server";
import {OrderController} from "./OrderController";
import {createRandomUser, getApiAuthHeaders} from "../../__tests__/helpers";
import {randomInt} from "crypto";
import {AccountController} from "./AccountController";
import {BadRequest} from "@tsed/exceptions";

describe.skip("OrderController", () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;

    beforeEach(PlatformTest.bootstrap(Server, {
        mount: {
            "/": [OrderController, AccountController]
        }
    }));
    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(PlatformTest.reset);

    jest.setTimeout(50 * 1000);
    it("should reject POST /list if any of required fields are missing", async () => {
        const {wallet} = await createRandomUser(request)
        // zkSync API response error: errorType: invalidDataError; code 208; message: NFT token ID should be greater than or equal to 65536
        const NFT_TOKEN_ID_START = 65536;
        const randomStr = () => {
            return Math.random() + "";
        }
        const origOrder: any = {
            accountId: randomInt(0, 200),
            amount: "1",
            price: randomInt(10, 100),
            recipient: randomStr(),
            nonce: randomInt(0, 200),
            tokenSell: randomInt(NFT_TOKEN_ID_START, NFT_TOKEN_ID_START + 200),
            tokenBuy: "ETH"
        }
        for (let i = 0; i < Object.keys(origOrder).length; ++i) {
            const key = Object.keys(origOrder)[i];
            const order = Object.assign({}, origOrder);
            delete order[key];
            const response = await request
                .post(`/order/list`)
                .set(await getApiAuthHeaders(wallet, {order}))
                .send({order})
                .expect(BadRequest.STATUS);
            expect(response.body.message).toMatch(`"${key}" is required`);
        }
    })
});
