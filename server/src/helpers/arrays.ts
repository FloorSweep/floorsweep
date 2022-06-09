/**
 * Returns typed object keys
 * @param obj
 */
export const objectKeys = <Obj>(obj: Obj): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[]
}

/**
 * Returns array of elements present in `search` but missing in `src`.
 * @param src array of object with key `field` to search from
 * @param search array of objects with key `field` to search
 * @param field
 */
export function arrayDiffSetByField<T, L, K extends keyof T, I extends keyof L>(src: T[], search: L[], field: I & K = 'id' as any): (T | L)[] {
  return search.reduce((accumulator, currentValue) => {
    const item = arrayFindByField(src, currentValue[field], field);
    if (!item) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, [] as L[]);
}

/**
 * Returns the first object found in array specified by field
 * @param array source of objects
 * @param val value of field to search
 * @param field key field to search
 */
export function arrayFindByField<T, K extends keyof T>(array: T[], val: any, field: K = 'id' as any): T | undefined {
  return array.find(item => item[field] == val);
}

/**
 * Returns merged array
 * @param array1
 * @param array2
 */
export function arrayMerge<T>(array1: T[], array2: T[]): T[] {
  return ([] as T[]).concat(array1, array2);
}

