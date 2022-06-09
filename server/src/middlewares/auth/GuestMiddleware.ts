import { Middleware, MiddlewareMethods } from "@tsed/platform-middlewares";
import { Req } from "@tsed/common";
import { Inject } from "@tsed/di";
import { AccountsRepository } from "../../../prisma/generated/tsed";
import {requiredAuthHeaderKeys} from "./constants";
import {objectKeys} from "../../helpers/arrays";
import {BadRequest} from "@tsed/exceptions";

@Middleware()
export class GuestMiddleware implements MiddlewareMethods {
  @Inject()
  private accounts: AccountsRepository

  public async use(@Req() request: Req) {
    objectKeys(requiredAuthHeaderKeys).forEach(key => {
      if (request.header(requiredAuthHeaderKeys[key])) {
        throw new BadRequest(`Header: ${requiredAuthHeaderKeys[key]} must not be set`)
      }
    })
  }
}
