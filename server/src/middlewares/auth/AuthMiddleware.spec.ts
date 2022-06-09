import { PlatformTest } from "@tsed/common";
import { AuthMiddleware } from "./AuthMiddleware";

describe("AuthMiddleware", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<AuthMiddleware>(AuthMiddleware);
    // const instance = PlatformTest.invoke<StagingMiddleware>(StagingMiddleware); // get fresh instance

    expect(instance).toBeInstanceOf(AuthMiddleware);
  });
});
