import {PlatformTest} from "@tsed/common";
import {ErrorExceptionFilter} from "./ErrorExceptionFilter";

describe("ErrorExceptionFilter", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<ErrorExceptionFilter>(ErrorExceptionFilter);
    // const instance = PlatformTest.invoke<ErrorExceptionFilter>(ErrorExceptionFilter); // get fresh instance

    expect(instance).toBeInstanceOf(ErrorExceptionFilter);
  });
});
