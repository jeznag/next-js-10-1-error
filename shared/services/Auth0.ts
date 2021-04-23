import { HttpClient, Logger, Environment, IEnvironment, Config } from '@services'
import { createStrongPassword } from '@utils'

// Reference: https://auth0.com/docs/api/management/v2/#!/Users/post_users
type Auth0User = {
    email?: string
    phone_number?: string
    blocked?: boolean
    email_verified?: boolean
    phone_verified?: boolean
    given_name?: string
    family_name?: string
    name?: string
    nickname?: string
    picture?: string
    user_id?: string
    connection: string
    password?: string
    verify_email?: boolean
    username?: string
}

type TokenResponse = {
    access_token: string,
    scope: string,
    expires_in: number,
    token_type: string
}

const AUTH0_DB_CONNECTION = 'Username-Password-Authentication'

export class Auth0 {
    private readonly client: HttpClient
    private readonly environment: IEnvironment
    private readonly url = `https://${Config.get('AUTH0_DOMAIN')}/api/v2/`

    constructor (client?: HttpClient, env?: IEnvironment) {
        this.client = client ?? new HttpClient()
        this.environment = env ?? Environment
    }

    private baseUrl (endpoint?: string): string {
        const apiEndpoint = `/auth0${endpoint ?? ''}`

        return this.environment.getInternalHarvestUrl(apiEndpoint)
    }

    public async getToken (): Promise<TokenResponse | Error> {
        const body = {
            grant_type: 'client_credentials',
            client_id: Config.get('AUTH0_API_CLIENT_ID'),
            client_secret: Config.get('AUTH0_API_CLIENT_SECRET'),
            audience: this.url
        }

        const response = await this.client.post(`https://${Config.get('AUTH0_DOMAIN')}/oauth/token`, body)

        if (response instanceof Error) return response

        // Parse the response
        const token = response as TokenResponse
        if (token.access_token === undefined || token.expires_in === undefined) {
            return new Error(`Auth0 API response did not contain required fields: ${response}`)
        }

        return token
    }

    public async changePassword (email: string): Promise<boolean> {
        const passwordChangeBody = {
            email: email,
            connection: AUTH0_DB_CONNECTION
        }

        const requestParams = {
            include_client_id: true
        }

        const passwordChangeResult = await this.client.post(
            this.baseUrl('/dbconnections/change_password'),
            passwordChangeBody,
            requestParams
        )

        if (passwordChangeResult instanceof Error) {
            Logger.error(passwordChangeResult)
            return false
        }

        return true
    }

    public async createUser (email: string): Promise<string | undefined> {
        const createUserBody = {
            email: email,
            blocked: false,
            email_verified: true,
            connection: AUTH0_DB_CONNECTION,
            password: createStrongPassword()
        }

        const createUserResult = await this.client.post(
            this.baseUrl('/api/v2/users'),
            createUserBody
        )

        if (createUserResult instanceof Error) {
            Logger.error(createUserResult)
            return undefined
        }

        return (createUserResult as Auth0User)?.user_id
    }

    public async deleteUser (auth0Id: string): Promise<boolean> {
        const isDeleted = await this.client.delete(this.baseUrl(`/api/v2/users/${auth0Id}`))

        if (isDeleted instanceof Error) {
            return false
        }

        return true
    }
}
