import { PlatformTest } from "@tsed/common";
import { LoggerService } from "./LoggerService";

describe("LoggerService", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<LoggerService>(LoggerService);
    // const instance = PlatformTest.invoke<LoggerService>(LoggerService); // get fresh instance

    expect(instance).toBeInstanceOf(LoggerService);
  });
});
