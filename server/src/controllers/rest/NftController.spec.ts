import { PlatformTest } from "@tsed/common";
import { NftController } from "./NftController";

describe("NftController", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<NftController>(NftController);
    // const instance = PlatformTest.invoke<NftController>(NftController); // get fresh instance

    expect(instance).toBeInstanceOf(NftController);
  });
});
