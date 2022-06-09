import { PlatformTest } from "@tsed/common";
import { HomeController } from "./HomeController";

describe("HomeController", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<HomeController>(HomeController);
    // const instance = PlatformTest.invoke<HomeController>(HomeController); // get fresh instance

    expect(instance).toBeInstanceOf(HomeController);
  });
});
