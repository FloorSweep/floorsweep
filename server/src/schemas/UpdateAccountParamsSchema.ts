import Joi from "joi";
import {isValidEthereumAddress} from "../helpers/strings";

export const UpdateAccountParamsSchema = Joi.object()
    .keys({
        email: Joi.string().trim().email(),
        displayName: Joi.string().trim().allow(null).custom((value, helper) => {
            if (isValidEthereumAddress(value)) {
                return helper.message({custom: "Cannot be an ethereum address"})
            }
            return value
        }),
        description: Joi.string().allow(null),
        websiteUrl: Joi.string().trim().uri().allow(null)
    })
    .meta({className: 'UpdateAccountParams'})
