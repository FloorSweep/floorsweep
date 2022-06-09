import Joi from "joi";

export const MAX_PAGE_SIZE = 100

export const CursorPaginationSchema = Joi.object()
    .keys({
        pageSize: Joi.number().max(MAX_PAGE_SIZE),
        cursor: Joi.number()
    })
    .meta({className: 'CursorPagination'})
