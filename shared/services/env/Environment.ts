export type EnvironmentConfig = {
    serverUrl: string
    serverPort: string
    clientUrl: string
    clientPort: string
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Window {
        Cypress: any
    }
}

export interface IEnvironment {
    isClient: boolean
    isServer: boolean
    isCypress: boolean
    getServerUrl: (endpoint?: string) => string
    getClientUrl: (endpoint?: string) => string
    getInternalHarvestUrl: (endpoint?: string) => string
    getExternalHarvestUrl: (endpoint?: string) => string
}

// TODO-3602: Add documentation
export class EnvironmentClass implements IEnvironment {
    private readonly serverUrl: string
    private readonly serverPort: string
    private readonly clientUrl: string
    private readonly clientPort: string

    constructor (options: EnvironmentConfig) {
        this.serverUrl = options.serverUrl
        this.serverPort = options.serverPort
        this.clientUrl = options.clientUrl
        this.clientPort = options.clientPort
    }

    public get isClient () { return typeof window !== 'undefined' }
    public get isServer () { return !this.isClient }
    public get isCypress () { return this.isClient && !!window.Cypress }

    public getServerUrl (endpoint = ''): string {
        return `${this.serverUrl}:${this.serverPort}${endpoint}`
    }

    private getWindowUrl (): string {
        const url = window.location
        const portStr = url.port ? `:${url.port}` : ''
        return `${url.protocol}//${url.hostname}${portStr}`
    }

    public getClientUrl (endpoint = ''): string {
        return `${this.getWindowUrl()}${endpoint}`
    }

    /**
     * Gets the most appropriate Harvest URL for internal use
     * If on the server's, we can use the servers URL, which will likely be localhost
     * This prevents the need to pipe requests via the public internet
     * If on the client, we can just get the public URL from the window
     */
    public getInternalHarvestUrl (endpoint = ''): string {
        const baseUrl = this.isServer
            ? `${this.serverUrl}:${this.serverPort}`
            : this.getWindowUrl()
        return `${baseUrl}${endpoint}`
    }

    /**
     * Gets the most appropriate Harvest URL for external use
     * If on the server, we can get the client url injected via env vars
     * (not accessible when on the client). If on the client, we can just
     * get the public URL from the window
     */
    public getExternalHarvestUrl (endpoint = ''): string {
        const baseUrl = this.isServer
            ? `${this.clientUrl}:${this.clientPort}`
            : this.getWindowUrl()

        return `${baseUrl}${endpoint}`
    }
}
