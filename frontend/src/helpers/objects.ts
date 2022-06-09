/**
 *
 * mutateNullKeyValsToEmptyString
 *
 * mutates object setting null keys to empty strings
 *
 *
 * @param object ie {thing: null} -> {thing: ""}
 *
 **/
export function mutateEmptyStringKeysToNull(obj: object) {
    Object.keys(obj).forEach(key => {
        // @ts-ignore
        if (obj[key] === "") obj[key] = null
    })
}

export function mutateNullKeysToEmptyString(obj: object) {
    Object.keys(obj).forEach(key => {
        // @ts-ignore
        if (obj[key] === null || obj[key] === undefined) obj[key] = ""
    })
}
