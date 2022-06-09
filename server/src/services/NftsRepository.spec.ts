import { PlatformTest } from "@tsed/common";
import { NftsRepository } from "./NftsRepository";

describe("NftsRepository", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<NftsRepository>(NftsRepository);
    // const instance = PlatformTest.invoke<NftsRepository>(NftsRepository); // get fresh instance

    expect(instance).toBeInstanceOf(NftsRepository);
  });
});
