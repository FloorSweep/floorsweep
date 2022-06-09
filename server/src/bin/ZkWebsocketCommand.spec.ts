import { PlatformTest } from "@tsed/common";
import { ZkWebsocketCommand } from "./ZkWebsocketCommand";

describe("ZkWebsocketCommand", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<ZkWebsocketCommand>(ZkWebsocketCommand);
    // const instance = PlatformTest.invoke<ZkWebsocketCommand>(ZkWebsocketCommand); // get fresh instance

    expect(instance).toBeInstanceOf(ZkWebsocketCommand);
  });
});
