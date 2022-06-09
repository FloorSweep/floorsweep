import { PlatformTest } from "@tsed/common";
import { AgendashModule } from "./AgendashModule";

describe("AgendashModule", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<AgendashModule>(AgendashModule);
    // const instance = PlatformTest.invoke<AgendashModule>(AgendashModule); // get fresh instance

    expect(instance).toBeInstanceOf(AgendashModule);
  });
});
