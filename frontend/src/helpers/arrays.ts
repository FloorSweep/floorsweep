
/**
 * Returns the first object found in array specified by field
 * @param array source of objects
 * @param val value of field to search
 * @param field key field to search
 */
export function arrayFindByField<T, K extends keyof T>(array: T[], val: any, field: K = 'id' as any): T | undefined {
  return array.find(item => item[field] == val);
}

export const objectKeys = <Obj>(obj: Obj): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[]
}

export function arrayMerge<T>(array1: T[], array2: T[]): T[] {
  return ([] as T[]).concat(array1, array2);
}

export function getShallowEqualDiffKeys<T, T2>(obj1: T, obj2: T2): Extract<keyof T | keyof T2, string>[] {
    const diff: Extract<keyof T | keyof T2, string>[] = []
    for (const [key,] of Object.entries(obj1)) {
        //@ts-ignore
        if (obj1[key] != obj2[key]) {
            //@ts-ignore
            diff.push(key)
        }
    }
    for (const [key,] of Object.entries(obj2)) {
        //@ts-ignore
        if (obj2[key] != obj1[key]) {
            //@ts-ignore
            if (!diff.includes(key)) {
                //@ts-ignore
                diff.push(key)
            }
        }
    }
    return diff;
}