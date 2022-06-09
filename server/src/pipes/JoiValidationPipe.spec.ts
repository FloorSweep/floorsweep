import { PlatformTest } from "@tsed/common";
import { JoiValidationPipe } from "./JoiValidationPipe";

describe.skip("JoiValidationPipe", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<JoiValidationPipe>(JoiValidationPipe);
    // const instance = PlatformTest.invoke<JoiValidationPipe>(JoiValidationPipe); // get fresh instance

    expect(instance).toBeInstanceOf(JoiValidationPipe);
  });
});
