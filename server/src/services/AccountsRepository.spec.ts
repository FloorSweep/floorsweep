import { PlatformTest } from "@tsed/common";
import { AccountsRepository } from "./AccountsRepository";

describe("AccountsRepository", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<AccountsRepository>(AccountsRepository);
    // const instance = PlatformTest.invoke<AccountsRepository>(AccountsRepository); // get fresh instance

    expect(instance).toBeInstanceOf(AccountsRepository);
  });
});
