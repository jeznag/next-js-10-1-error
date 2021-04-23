import { DateTime } from 'luxon'

import {
    Dictionary,
    ApiConditionParam,
    Condition,
    CriticalApiError,
    ApiMetaData,
    Fragment
} from '@shared-types'
import {
    Logger,
    Environment,
    IEnvironment,
    Config,
    IConfig,
    HttpClient
} from '@services'

export const MAX_ROWS = 99
export const MIN_ROWS = 20

type RequiredJoinParams = ApiConditionParam & {
    _join: string
    _on1: string
}

export type XMysqlColumnDesciption = {
    Field: string
    Type: string
    Null: string
    Key: string
    Default: any
    Extra: string
}

// Some expected responses from xMySQL API
type XMysqlCountResponse = { no_of_rows: number }
type XMysqlModifyResponse = { affectedRows: number, insertId: number }
type XMysqlErrorResponse = { error: { code: string, sqlMessage: string } }
export type XMysqlDescribeResponse = XMysqlColumnDesciption[]

// Type guards for the above responses
const isXMysqlCountResponse = (data: any): data is XMysqlCountResponse => (
    data !== undefined && 'no_of_rows' in data
)
const isXMysqlModifyResponse = (data: any): data is XMysqlModifyResponse => (
    data !== undefined && 'affectedRows' in data && 'insertId' in data
)
const isXMysqlErrorResponse = (data: any): data is XMysqlErrorResponse => (
    data !== undefined && 'error' in data && 'code' in data.error && 'sqlMessage' in data.error
)
const isXMysqlColumnDesciption = (data: any): data is XMysqlColumnDesciption => (
    data !== undefined && 'Field' in data && 'Type' in data
)
const isXMysqlDesribeResponse = (data: any): data is XMysqlDescribeResponse => (
    data !== undefined && Array.isArray(data) && data.every(column => isXMysqlColumnDesciption(column))
)

export class XMysqlApi<T> {
    private readonly entityName: string
    private readonly entityFields: Array<string> = []
    private readonly client: HttpClient
    private readonly env: IEnvironment
    private readonly config: IConfig

    constructor (
        entityName: string,
        entityFields: string[],
        client?: HttpClient,
        environment?: IEnvironment,
        config?: IConfig
    ) {
        this.entityName = entityName
        this.entityFields = entityFields
        this.client = client === undefined ? new HttpClient() : client
        this.env = environment ?? Environment
        this.config = config ?? Config
    }

    public baseUrlForJoin (): string {
        return this.baseUrl('/api/xjoin')
    }

    public baseUrl (endpoint?: string): string {
        const apiEndpoint = endpoint || `/api/${this.entityName}`

        if (this.env.isServer || this.env.isCypress) {
            return `${this.config.get('OKRA_API_URL')}:${this.config.get('OKRA_API_PORT')}${apiEndpoint}`
        }

        return this.env.getClientUrl(apiEndpoint)
    }

    public async getFromKey (key: number): Promise<T | Error | undefined> {
        const data: ApiConditionParam = {
            _where: `(${this.entityName}_pk,eq,${key})`
        }

        const response = await this.client.get(this.baseUrl(), data)

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (Array.isArray(response) && response.length > 0) {
            return (response as T[])[0]
        }

        return undefined
    }

    private async getWithCustomUrl<DataType> (customUrl: string, condition?: ApiConditionParam, size: number = MIN_ROWS, page = 0): Promise<Array<DataType> | Error> {
        // Enforce xMySql page size limit
        if (size > MAX_ROWS) {
            return new Error('Can only fetch maximum of 99 entries at a time.')
        }

        const data: ApiConditionParam = {
            _p: page,
            _size: size,
            ...condition
        }

        if (this.entityFields.length > 0 && !condition?._fields) {
            data._fields = this.entityFields.join(',')
        }

        const response = await this.client.get(customUrl, data)

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (!Array.isArray(response)) {
            return new Error(`Invalid response: ${response}. Condition: ${condition}`)
        }

        return response as Array<DataType>
    }

    public async get (condition?: ApiConditionParam, size: number = MIN_ROWS, page = 0): Promise<Array<T> | Error> {
        return this.getWithCustomUrl<T>(this.baseUrl(), condition, size, page)
    }

    public async getAllWithCustomEntity<DataType> (condition?: ApiConditionParam, customEntity?: string): Promise<Array<DataType> | Error> {
        const size = MAX_ROWS // Set size to maximum to get all the entities faster
        const pageCount = await this.getPageCount(customEntity, size, condition)
        if (pageCount instanceof Error) return pageCount

        const promisedResults: Promise<Array<DataType> | Error>[] = []

        const url = this.baseUrl(`/api/${customEntity || this.entityName}`)

        for (let page = 1; page <= pageCount; page++) {
            const promisedResult = this.getWithCustomUrl<DataType>(url, condition, size, page)
            promisedResults.push(promisedResult)
        }

        const results = await Promise.all(promisedResults)

        const error = results.find(result => result instanceof Error)
        if (error) return error

        return (results as Array<DataType>[]).flat()
    }

    public async getAll (condition?: ApiConditionParam): Promise<Array<T> | Error> {
        return this.getAllWithCustomEntity<T>(condition)
    }

    public async getAllMatches (field: string, searchString: string, condition?: ApiConditionParam): Promise<Array<T> | Error> {
        // Don't spam the database if string is empty
        if (searchString === '') return []

        let whereCondition = `(${field},like,~${searchString}~)`
        if (condition && condition._where) {
            whereCondition += `~and${condition._where}`
        }

        const mergedConditions = { ...condition }
        mergedConditions._where = whereCondition

        return this.getAll(mergedConditions)
    }

    public async getJoin<J> (joinParams: RequiredJoinParams): Promise<Array<J> | Error> {
        if (!this.validateJoinParams(joinParams)) {
            return new Error('Invalid join parameters. See https://github.com/o1lab/xmysql#xjoin.')
        }

        const rows: Array<J> = []
        let page = 1
        let rowLength = 0

        do {
            const response = await this.client.get(
                this.baseUrlForJoin(),
                {
                    ...joinParams,
                    _p: page,
                    _size: MAX_ROWS
                }
            )

            const err = this.checkResponseForErrors(response)
            if (err instanceof Error) return err

            if (!Array.isArray(response)) {
                return new Error(`Invalind response: ${response}`)
            }

            rows.push(...response)
            rowLength = response.length
            page += 1
        } while (rowLength >= MAX_ROWS)

        return rows
    }

    public parseCondition (condition: Condition, aliasName?: string) {
        if (!aliasName && !Object.keys(condition).every(columnName => this.entityFields.includes(columnName))) {
            throw new Error('Provided condition is invalid. Please check if column names are valid.')
        }

        const conditionList = []
        for (const [key, value] of Object.entries(condition)) {
            const columnName = aliasName ? `${aliasName}.${key}` : key
            conditionList.push(`(${columnName},in,${value})`)
        }

        return { _where: conditionList.join('~and') }
    }

    /**
     * Returns the primary key of the new record OR error
     * @param insertData
     */
    public async insert<U extends Fragment<U, T>> (
        insertData: U
    ): Promise<number | Error> {
        const response = await this.client.post(this.baseUrl(), insertData)

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (!isXMysqlModifyResponse(response)) return new Error(`Insert returned unexpected response: ${response}`)

        if (response.affectedRows <= 0 || response.insertId <= 0) return new Error(`Insert failed: ${response}`)

        return response.insertId
    }

    /*
    * Enables you to insert multiple entries at the same time.
    * Rather than passing an object, you need to pass an array
    * of objects to be inserted. As xMySQL does not support
    * returning all the ids of the inserted rows, we would return
    * the number of inserted rows instead.
    */
    public async bulkInsert<U extends Fragment<U, T>> (
        insertDataArray: U[]
    ): Promise<number | Error> {
        const bulkUrl = `${this.baseUrl()}/bulk`

        const response = await this.client.post(bulkUrl, insertDataArray)

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (!isXMysqlModifyResponse(response)) return new Error(`Bulk insert returned unexpected response: ${response}`)

        if (response.affectedRows <= 0 || response.insertId <= 0) return new Error(`Bulk insert failed: ${response}`)

        return response.affectedRows
    }

    public async bulkDelete (primaryKeys: number[]): Promise<boolean | Error> {
        const endpoint = `${this.baseUrl()}/bulk?_ids=${primaryKeys.join(',')}`

        const response = await this.client.delete(endpoint)

        if (!isXMysqlModifyResponse(response)) return new Error(`Update returned unexpected response: ${response}`)

        return response.affectedRows > 0
    }

    /*
    * Update behaviour:
    * Any properties that are undefined will be skipped
    * Any value that is null will be set to null in the database, i.e removing the value
    * Setting a property to null should only be possible for nullable database fields.
    *
    * It is mandatory for tables that will be updated to have `updated_at` field.
    */
    public async updateFromKey<U extends Fragment<U, T>> (
        primaryKey: number,
        updateData: U,
        metaData?: ApiMetaData
    ): Promise<boolean | Error> {
        const endpoint = `${this.baseUrl()}/${primaryKey}`
        const headers = metaData ? this.metaDataToHeaders(metaData) : undefined

        const cleanedData = this.removeUndefinedProperties(updateData)
        cleanedData.updated_at = DateTime.utc().toSQL()

        const response = await this.client.patch(endpoint, cleanedData, headers)

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (!isXMysqlModifyResponse(response)) return new Error(`Update returned unexpected response: ${response}`)

        return response.affectedRows > 0
    }

    public async deleteFromKey (primaryKey: number): Promise<boolean | Error> {
        const endpoint = `${this.baseUrl()}/${primaryKey}`
        const response = await this.client.delete(endpoint)

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (!isXMysqlModifyResponse(response)) return new Error(`Delete returned unexpected response: ${response}`)

        return response.affectedRows > 0
    }

    private checkResponseForErrors (response: unknown): Error | unknown {
        // This closure exists so we can easily log the error if we find one
        const findError = (res: unknown): Error | undefined => {
            if (res === undefined) return new Error('Response is undefined')

            if (res instanceof Error) {
                return this.isCriticalError(res.message)
                    ? new CriticalApiError(res.message)
                    : res
            }

            if (!isXMysqlErrorResponse(res)) return undefined

            return this.isCriticalError(res.error.code)
                ? new CriticalApiError(res.error.code)
                : new Error(res.error.sqlMessage)
        }

        const error = findError(response)
        if (error instanceof Error) {
            Logger.error(error)
            return error
        }

        return response
    }

    // Critical errors can be but not limited to xMySQL or MySQL server
    // being down or inaccessible
    private isCriticalError (errorMessage: string): boolean {
        const criticalErrorList = [
            'ENOTFOUND',
            'ECONNREFUSED',
            'EACCES'
        ]

        return criticalErrorList.some(criticalError => errorMessage.includes(criticalError))
    }

    // Basic validation of the required params for the
    // join syntax of xMySQL. Validates that there are joins
    // and the number of joins should correspond to the number
    // of `_on`s.
    // For reference: https://github.com/o1lab/xmysql#xjoin
    private validateJoinParams (joinParams: RequiredJoinParams): boolean {
        const isWrappedInWhitespace = Object.values(joinParams).find(param => {
            if (typeof param === 'number' || typeof param === 'boolean') {
                return false
            }

            return param.match(/(^\s+)|(\s+$)/)
        })
        if (isWrappedInWhitespace) {
            return false
        }

        if (!('_join' in joinParams)) {
            return false
        }

        const joinTables = joinParams._join.split(/,_[ilr]?j,/)

        // Should have at least 2 joined tables
        if (joinTables.length < 2) {
            return false
        }

        // _on<nth join> params should match the number of tables minus one
        // (number of _on params = number of tables - 1)
        const expectedOnNumbers = joinTables.length - 1
        const onParams = Object.keys(joinParams).filter(param => param.includes('_on'))
        if (expectedOnNumbers !== onParams.length) {
            return false
        }

        return true
    }

    private async getPageCount (customEntity: string | undefined, size: number = MIN_ROWS, condition?: ApiConditionParam): Promise<number | Error> {
        const response = await this.client.get(
            `${this.baseUrl(`/api/${customEntity || this.entityName}`)}/count`,
            condition
        )

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (!Array.isArray(response)) {
            return new Error(`Invalid count response: ${response}.`)
        }

        const countResponse = response[0]

        if (!isXMysqlCountResponse(countResponse)) return new Error(`Get returned unexpected response: ${countResponse}`)

        const rowCount = countResponse.no_of_rows
        const pageExcess = rowCount % size

        let pageCount = Math.floor(rowCount / size)
        if (pageExcess > 0) {
            pageCount += 1
        }

        return pageCount
    }

    private removeUndefinedProperties (data: Dictionary<any>): Dictionary<any> {
        const cleanedData: Dictionary<any> = {}

        // JSON does not accept undefined as a value
        for (const [key, value] of Object.entries(data)) {
            // If any value is undefined, skip it.
            if (value === undefined) continue
            else cleanedData[key] = value
        }

        return cleanedData
    }

    private async isFieldExisting (fieldName: string): Promise<Error | boolean> {
        const url = `${this.baseUrl()}/describe`

        const response = await this.client.get(url)

        const err = this.checkResponseForErrors(response)
        if (err instanceof Error) return err

        if (!isXMysqlDesribeResponse(response)) return new Error(`Get returned unexpected response: ${response}`)

        const fieldNames = response.map(column => column.Field)

        return fieldNames.includes(fieldName)
    }

    private metaDataToHeaders (metaData: ApiMetaData) {
        const headers: Dictionary = {}
        if (metaData.apiCallId) { headers['Api-Call-Id'] = metaData.apiCallId }
        return headers
    }
}
