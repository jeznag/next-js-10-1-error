import { Dictionary, JSONType } from '@shared-types'
import { Environment, IEnvironment } from '@services'
import { fetchWithTimeout, RequestInitWithTimeout } from '@utils'

export class OfflineError extends Error {
    constructor (message: string) {
        super(message)

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, OfflineError.prototype)
    }
}

type Options = {
    timeout?: number,
    headers: Dictionary
}
export class HttpClient {
    private readonly env: IEnvironment
    private readonly requestParams: RequestInitWithTimeout

    constructor (options?: Options, environment?: IEnvironment) {
        this.env = environment || Environment
        this.requestParams = {
            headers: options?.headers,
            timeout: options?.timeout,
            // NOTE: This is set only because we include logging-in
            // in Auth0 during Cypress test runs. This causes the
            // browser to think that our API requests come from a
            // different origin (registered initial origin is from
            // the Auth0 domain).
            // We can remove these options once we figured out how
            // to opt-out from logging in via Auth0 login page.
            credentials: this.env.isCypress ? 'omit' : 'include'
        }
    }

    public async get (endpoint: string, requestParams?: Dictionary<string | number | boolean>): Promise<unknown> {
        let formattedUri = HttpClient.formatUri(endpoint)

        if (requestParams !== undefined) {
            formattedUri = `${formattedUri}?${HttpClient.formatData(requestParams)}`
        }

        try {
            const response = await fetchWithTimeout(formattedUri, this.requestParams)
            return this.parseResponse(response)
        } catch (err) {
            if (err instanceof TypeError) {
                return new OfflineError(err.message)
            }
            return err
        }
    }

    public async post (
        endpoint: string,
        body?: JSONType,
        requestParams?: Dictionary<string | number | boolean>,
        headers?: Dictionary
    ): Promise<unknown> {
        let formattedUri = HttpClient.formatUri(endpoint)

        if (requestParams !== undefined) {
            formattedUri = `${formattedUri}?${HttpClient.formatData(requestParams)}`
        }

        const postParams: RequestInit = {
            ...this.requestParams,
            headers: {
                ...this.requestParams.headers,
                ...headers,
                'Content-Type': 'application/json'
            },
            method: 'POST'
        }
        if (body) postParams.body = JSON.stringify(body)

        try {
            const response = await fetchWithTimeout(formattedUri, postParams)
            return this.parseResponse(response)
        } catch (err) {
            if (err instanceof TypeError) {
                return new OfflineError(err.message)
            }
            return err
        }
    }

    public async delete (
        endpoint: string,
        requestParams?: Dictionary<string | number | boolean>,
        headers?: Dictionary
    ): Promise<unknown> {
        let formattedUri = HttpClient.formatUri(endpoint)
        if (requestParams) formattedUri = `${formattedUri}?${HttpClient.formatData(requestParams)}`

        const deleteParams: RequestInit = {
            ...this.requestParams,
            method: 'DELETE',
            headers: {
                ...this.requestParams.headers,
                ...headers,
                'Content-Type': 'application/json'
            }
        }

        try {
            const response = await fetchWithTimeout(formattedUri, deleteParams)
            return this.parseResponse(response)
        } catch (err) {
            if (err instanceof TypeError) {
                return new OfflineError(err.message)
            }
            return err
        }
    }

    public async patch (
        endpoint: string,
        body: JSONType,
        headers?: Dictionary
    ): Promise<unknown> {
        const formattedUri = HttpClient.formatUri(endpoint)
        const patchParams: RequestInit = {
            ...this.requestParams,
            headers: {
                'Content-Type': 'application/json',
                ...this.requestParams.headers,
                ...headers
            },
            method: 'PATCH',
            body: JSON.stringify(body)
        }

        try {
            const response = await fetchWithTimeout(formattedUri, patchParams)
            return this.parseResponse(response)
        } catch (err) {
            if (err instanceof TypeError) {
                return new OfflineError(err.message)
            }
            return err
        }
    }

    private async parseResponse (response: Response): Promise<unknown> {
        if (response.status >= 400) {
            return this.parseHttpError(response)
        }

        const responseText = await response.text()
        const contentType = response.headers.get('content-type')

        if (contentType && contentType.includes('application/json')) {
            return responseText !== '' ? JSON.parse(responseText) : responseText
        }

        return responseText
    }

    private async parseHttpError (response: Response): Promise<Error> {
        const errorMessage = await response.text()

        const error = response.status
            ? `HTTP response: ${response.status}, ${errorMessage}`
            : errorMessage

        return new Error(error)
    }

    public static formatUri (endpoint: string): string {
        return encodeURI(endpoint)
    }

    public static formatData (data: Dictionary<string | number | boolean>): string {
        const results = Object.keys(data)
            .filter((key) => !!data[key])
            .map(key => encodeURI(key) + '=' + encodeURIComponent(data[key]))
        return results.sort().join('&')
    }
}
