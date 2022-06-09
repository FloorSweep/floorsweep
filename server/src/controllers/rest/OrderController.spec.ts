import { PlatformTest } from "@tsed/common";
import { OrderController } from "./OrderController";

describe("OrderController", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<OrderController>(OrderController);
    // const instance = PlatformTest.invoke<NftController>(NftController); // get fresh instance

    expect(instance).toBeInstanceOf(OrderController);
  });
});
