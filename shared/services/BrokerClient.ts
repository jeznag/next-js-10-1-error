import { HttpClient, Environment, IEnvironment } from '@services'

export class BrokerClient {
    protected readonly client: HttpClient
    protected readonly environment: IEnvironment

    constructor (client?: HttpClient, environment?: IEnvironment) {
        this.client = client ?? new HttpClient()
        this.environment = environment ?? Environment
    }

    protected baseUrl (endpoint?: string): string {
        const apiEndpoint = endpoint || '/broker'

        return this.environment.getInternalHarvestUrl(apiEndpoint)
    }

    public async publishUpdatePackage (consumerUuid: string): Promise<undefined | Error> {
        const endpoint = `${this.baseUrl()}/${consumerUuid}/package/modify`

        const response = await this.client.post(endpoint)

        // return !(response instanceof Error)
        return response instanceof Error ? response : undefined
    }
}
