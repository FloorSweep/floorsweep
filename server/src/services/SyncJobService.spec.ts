import { PlatformTest } from "@tsed/common";
import { SyncJobService } from "./SyncJobService";

describe("SyncJobService", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<SyncJobService>(SyncJobService);
    // const instance = PlatformTest.invoke<SyncJobService>(SyncJobService); // get fresh instance

    expect(instance).toBeInstanceOf(SyncJobService);
  });
});
