import { PlatformTest } from "@tsed/common";
import { MaybeAuthMiddleware } from "./MaybeAuthMiddleware";

describe("MaybeAuthMiddleware", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<MaybeAuthMiddleware>(MaybeAuthMiddleware);

    expect(instance).toBeInstanceOf(MaybeAuthMiddleware);
  });
});
