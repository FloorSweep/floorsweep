import { PlatformTest } from "@tsed/common";
import { AgendaWorkerCommand } from "./AgendaWorkerCommand";

describe("AgendaWorkerCommand", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<AgendaWorkerCommand>(AgendaWorkerCommand);
    // const instance = PlatformTest.invoke<AgendaWorkerCommand>(AgendaWorkerCommand); // get fresh instance

    expect(instance).toBeInstanceOf(AgendaWorkerCommand);
  });
});
