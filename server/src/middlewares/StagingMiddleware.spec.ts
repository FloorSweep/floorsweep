import { PlatformTest } from "@tsed/common";
import { StagingMiddleware } from "./StagingMiddleware";

describe("StagingMiddleware", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<StagingMiddleware>(StagingMiddleware);

    expect(instance).toBeInstanceOf(StagingMiddleware);
  });
});
