import {PlatformTest, Req} from "@tsed/common";
import { GuestMiddleware } from "./GuestMiddleware";
import {Context} from "@tsed/platform-params";

describe("GuestMiddleware", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<GuestMiddleware>(GuestMiddleware);
    // const instance = PlatformTest.invoke<StagingMiddleware>(StagingMiddleware); // get fresh instance

    expect(instance).toBeInstanceOf(GuestMiddleware);
  });
});
