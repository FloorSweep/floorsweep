import { PlatformTest } from "@tsed/common";
import { PinataService } from "./PinataService";

describe("PinataService", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<PinataService>(PinataService);
    // const instance = PlatformTest.invoke<PinataService>(PinataService); // get fresh instance

    expect(instance).toBeInstanceOf(PinataService);
  });
});
