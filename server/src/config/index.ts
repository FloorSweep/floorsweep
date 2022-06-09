import {readFileSync} from "fs";
import {envs} from "./envs";
import loggerConfig from "./logger";

export const config: Partial<TsED.Configuration> = {
  version: '1.0',
  envs,
  logger: loggerConfig,
  // additional shared configuration
};
export {ORDER_STATUS_NEW} from "./constants";
export {ORDER_STATUS_COMPLETED} from "./constants";