export function model<T extends object>(obj: T, key: keyof T, onChange?: (val: any) => void) {
    return {
        value: obj[key] as any,
        name: key as any,
        onChange: (val: any) => {
            return onChange ? onChange(val) : (obj[key] = val)
        }
    };
}