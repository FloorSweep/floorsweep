import { PlatformTest } from "@tsed/common";
import { IpfsService } from "./IpfsService";

describe("IpfsService", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<IpfsService>(IpfsService);
    // const instance = PlatformTest.invoke<IpfsService>(IpfsService); // get fresh instance

    expect(instance).toBeInstanceOf(IpfsService);
  });
});
