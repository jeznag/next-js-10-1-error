import { Dictionary } from '@shared-types'

export type ApiConditionParam = Dictionary<string | number | boolean>

export class CriticalApiError extends Error {
    constructor (message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export type ApiMetaData = {
    apiCallId?: string
}

export type Condition = { [columnName: string]: string | number }
