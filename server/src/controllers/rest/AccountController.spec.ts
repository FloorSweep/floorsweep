import { PlatformTest } from "@tsed/common";
import { AccountController } from "./AccountController";

describe("AccountController", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<AccountController>(AccountController);
    // const instance = PlatformTest.invoke<AccountController>(AccountController); // get fresh instance

    expect(instance).toBeInstanceOf(AccountController);
  });
});
