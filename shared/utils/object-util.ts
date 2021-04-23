export class ObjectUtil {
    public static isEmpty (passedObject: Record<string, unknown>): boolean {
        if (!this.isObject(passedObject)) {
            throw new TypeError('Passed value is not an object')
        }

        return Object.keys(passedObject).length === 0
    }

    public static isObject (value: Record<string, unknown>): boolean {
    // Need to handle objects that does not have constructors
    // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
        return !!value && (
            value.constructor === Object ||
        (value.constructor === undefined && typeof value === 'object')
        )
    }

    public static isUndefinedOrNull (value: unknown): boolean {
        return value === undefined || value === null
    }
}
