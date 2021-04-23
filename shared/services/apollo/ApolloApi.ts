import {
    HttpClient,
    Logger,
    Environment,
    IEnvironment,
    Config,
    IConfig
} from '@services'

import {
    JSONType,
    ApiConditionParam,
    CriticalApiError,
    ApiMetaData,
    Dictionary,
    Fragment
} from '@shared-types'

export type ApolloOptions = {
    /**
     * Used to override the entityName `/apollo/(entity name)` e.g. `/apollo/install`.
     * Mostly used in endpoints with aggregates e.g. `/apollo/install/node`.
     */
    overrideEntityName: string
}

export class ApolloApi<ApiData> {
    private readonly client: HttpClient
    private readonly entityName: string
    private readonly env: IEnvironment
    private readonly config: IConfig

    constructor (
        entityName: string,
        client?: HttpClient,
        environment?: IEnvironment,
        config?: IConfig
    ) {
        this.entityName = entityName
        this.client = client ?? new HttpClient()
        this.env = environment ?? Environment
        this.config = config ?? Config
    }

    public baseUrl (endpoint?: string): string {
        let apiEndpoint = `/apollo/${endpoint || this.entityName}`

        if (this.env.isServer || this.env.isCypress) {
            apiEndpoint = endpoint || `/${this.entityName}`

            return `${this.config.get('APOLLO_API_URL')}:${this.config.get('APOLLO_API_PORT')}${apiEndpoint}`
        }

        return this.env.getClientUrl(apiEndpoint)
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

    private checkResponseErrors (response: unknown): Error | unknown {
        // This closure exists so we can easily log the error if we find one
        const findError = (res: unknown): Error | undefined => {
            if (res === undefined) return new Error('Response is undefined')

            if (res instanceof Error) {
                return this.isCriticalError(res.message)
                    ? new CriticalApiError(res.message)
                    : res
            }

            return undefined
        }

        const error = findError(response)
        if (error instanceof Error) {
            Logger.error(error)
            return error
        }

        return response
    }

    public async getAllWithCustomEntity<DataType> (
        condition?: ApiConditionParam, customEntity?: string
    ): Promise<DataType[] | Error> {
        const url = this.baseUrl(customEntity)

        const response = await this.client.get(url, condition)

        const err = this.checkResponseErrors(response)
        if (err instanceof Error) return err

        if (!Array.isArray(response)) {
            return new Error(`Invalid response: ${response}.`)
        }

        return response as DataType[]
    }

    // Note: Do we enforce page size limit?
    public async getAll (condition?: ApiConditionParam): Promise<ApiData[] | Error> {
        return this.getAllWithCustomEntity<ApiData>(condition)
    }

    public async getFromId (id: number): Promise<ApiData | Error> {
        const url = `${this.baseUrl()}/${id}`

        const response = await this.client.get(url)

        const err = this.checkResponseErrors(response)
        if (err instanceof Error) return err

        return response as ApiData
    }

    public async create<OverrideApiData = ApiData> (
        body: JSONType, metaData?: ApiMetaData
    ): Promise<OverrideApiData | Error> {
        const headers = metaData ? this.metaDataToHeaders(metaData) : undefined

        const response = await this.client.post(this.baseUrl(), body, undefined, headers)

        const err = this.checkResponseErrors(response)
        if (err instanceof Error) return err

        return response as OverrideApiData
    }

    public async update<PartialData extends Fragment<PartialData, ApiData>> (
        id: number | string, updateData: PartialData, options?: ApolloOptions, metaData?: ApiMetaData
    ): Promise<ApiData | Error> {
        const url = `${this.baseUrl(options?.overrideEntityName ?? '')}/${id}`
        const headers = metaData ? this.metaDataToHeaders(metaData) : undefined
        const cleanedData = this.removeUndefinedProperties(updateData)

        const response = await this.client.patch(url, cleanedData, headers)

        const err = this.checkResponseErrors(response)
        if (err instanceof Error) return err

        return response as ApiData
    }

    public async delete (
        id: number | string, condition?: ApiConditionParam, options?: ApolloOptions, metaData?: ApiMetaData
    ): Promise<void | Error> {
        const url = `${this.baseUrl(options?.overrideEntityName ?? '')}/${id}`
        const headers = metaData ? this.metaDataToHeaders(metaData) : undefined

        const response = await this.client.delete(url, condition, headers)

        const err = this.checkResponseErrors(response)
        if (err instanceof Error) return err
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

    private metaDataToHeaders (metaData: ApiMetaData) {
        const headers: Dictionary = {}

        if (metaData.apiCallId) { headers['Api-Call-Id'] = metaData.apiCallId }

        return headers
    }
}
