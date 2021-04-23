import { Dictionary } from 'shared/types'

export function toCamelCase (str: string) {
    return str
        .toLowerCase()
        .replace(/[-_]+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/ (.)/g, function (match) {
            return match.toUpperCase()
        })
        .replace(/ /g, '')
}

export function objectToCamelCase (origObj: Dictionary<any>) {
    return Object.keys(origObj).reduce(function (newObj: Dictionary<any>, key) {
        const val = origObj[key]
        const newVal = typeof val === 'object' ? objectToCamelCase(val) : val
        newObj[toCamelCase(key)] = newVal
        return newObj
    }, {})
}

export function podUUIDFromQrCode (rawQrCode: string): string | Error {
    // v1 qr codes: EDAMAME,1,0.5.1,1.0.1,05D6FF373232545243258220,05D9FF373232545243255617,0,03_Apr_16:53
    // v2 qr codes: 05D4FF373232545243147032
    // v3 qr codes: 03,P-1000008,2020-04-29,05D5FF373232545243248227
    // v4 qr codes: 04,P-1000001-V1.2,2020-07-21,05D6FF373232545243258220
    // v5 qr codes: 05,P-1000001-V1.2,2020-07-21,01,05D6FF373232545243258220
    const splitData = rawQrCode.split(',')
    let uuid
    // v1
    if (splitData[0] === 'EDAMAME') {
        uuid = splitData[4]
    }

    // v2
    if (splitData.length === 1) {
        uuid = splitData[0]
    }

    // v3, v4
    if (['03', '04'].includes(splitData[0])) {
        uuid = splitData[3]
    }

    // v5
    if (splitData[0] === '05') {
        uuid = splitData[4]
    }

    return uuid || new Error('Pod qr code could not be parsed.')
}

export function consumerUUIDFromQrCode (rawQrCode: string): string | Error {
    // v1 qr codes: {'bill_number': '19uNwr6', 'type': 'internal_domestic_payment', 'receiver': 'okrasolar'}
    // v2 qr codes: {"uuid": "FjOikTV"}

    // v1 qr code data is JSON, but is formatted with single quotes.
    // they need to be double quotes in order to be parsed as json.
    // so replace any single quotes before proceding
    const qrCodeArray = rawQrCode.split("'")
    const qrCodeCleaned = qrCodeArray.join('"')
    try {
        const jsonData = JSON.parse(qrCodeCleaned)

        if (jsonData.bill_number) {
            return jsonData.bill_number
        }

        if (jsonData.uuid) {
            return jsonData.uuid
        }
        return new Error('House qr code is missing data')
    } catch (err) {
        return new Error('House qr code could not be parsed.')
    }
}

/**
 * The `Form` fields from `grommet` can be initially defined as undefined
 * but there would be times that we need all the fields to be filled out.
 * This function checks that all the fields are filled and would also
 * reflect in TypesScript.
 *
 * @param formValues
 */
export const isFilledOutForm = <InitialForm extends Dictionary<unknown>> (formValues: InitialForm): formValues is Required<InitialForm> => {
    return Object.values(formValues).every(value => value !== undefined)
}

export const areStringArraysEqual = (array1: string[], array2: string[]): boolean => {
    array1.sort()
    array2.sort()

    if (array1.length !== array2.length) return false
    if (array1.some((value, index) => value !== array2[index])) return false

    return true
}
