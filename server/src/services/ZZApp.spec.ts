import { PlatformTest } from "@tsed/common";
import { ZZApp } from "./ZZApp";

describe("ZZApp", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<ZZApp>(ZZApp);
    // const instance = PlatformTest.invoke<ZZApp>(ZZApp); // get fresh instance

    expect(instance).toBeInstanceOf(ZZApp);
  });
});
