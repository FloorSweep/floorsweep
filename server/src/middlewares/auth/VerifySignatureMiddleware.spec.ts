import { PlatformTest } from "@tsed/common";
import { VerifySignatureMiddleware } from "./VerifySignatureMiddleware";

describe("VerifySignatureMiddleware", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<VerifySignatureMiddleware>(VerifySignatureMiddleware);

    expect(instance).toBeInstanceOf(VerifySignatureMiddleware);
  });
});
