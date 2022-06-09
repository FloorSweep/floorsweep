import Joi from "joi";
import {CursorPaginationSchema} from "./CursorPaginationSchema";

export const GetNftsQueryParametersSchema = Joi.object()
    .keys({
        id: Joi.number(),
        address: Joi.string(),
        createdAt: Joi.date(),
        updateAt: Joi.date(),
        tokenId: Joi.number(),
        imageCID: Joi.string(),
        metadataCID: Joi.string(),
        zkContentHash: Joi.string(),
        creatorAddress: Joi.string(),
        ownerAddress: Joi.string(),
        metadata: Joi.object(),
        order: Joi.object(),
        nftObject: Joi.object(),
        lastValidatedAt: Joi.date(),
        name: Joi.string()
    })
    .concat(CursorPaginationSchema)
    .meta({className: 'GetNftsQueryParameters'})
