import Joi from "joi";

export const ListOrderSchema = Joi.object()
    .keys({
        accountId: Joi.number().required(),
        amount: Joi.string().equal("1").required(),
        ethSignature: Joi.object().required(),
        nonce: Joi.number().required(),
        ratio: Joi.array().required(),
        recipient: Joi.string().required(),
        signature: Joi.object().required(),
        tokenBuy: Joi.number().required(),
        tokenSell: Joi.number().required(),
        validFrom: Joi.number().required(),
        validUntil: Joi.number().required()
    })
    .meta({className: 'ListOrder'})

