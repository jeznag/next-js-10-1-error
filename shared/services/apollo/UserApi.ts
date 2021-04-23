import { HttpClient } from '@services'
import { ApolloApi } from './ApolloApi'
import { DescoApi } from './DescoApi'
import { DateTime } from 'luxon'

type UserDTO = {
    user_id: number
    email: string
    auth0_id: string | null
    language?: string
    desco_id: number
    last_login_at: string | null
    is_deleted: number
}

export type ExternalUser = {
    userId: number
    email: string
    auth0Id?: string
    language?: string
    descoId: number
    lastLoginAt?: DateTime
    descoName: string
    descoUrlSlug: string
}

export class UserApi {
    private readonly baseApi: ApolloApi<UserDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('users', client)
    }

    public async getUserFromEmail (email: string, includeDeletedUsers = false): Promise<ExternalUser | undefined | Error> {
        const users = await this.baseApi.getAll({
            email,
            ...(includeDeletedUsers === false && { is_deleted: 0 })
        })

        if (users instanceof Error) return users
        if (!users.length) return undefined


        // TECHDEBT: we should not use the APIs classes inside of the API classes like this.
        // If we want to join entities like this it should be done in the next layer up
        // OR via a relationship query param provided by the API endpoint.
        // Do not copy this code.
        const user = users[0]
        const descoApi = new DescoApi()
        const desco = await descoApi.getFromId(user.desco_id)

        if (desco instanceof Error) return desco

        return {
            userId: user.user_id,
            email: user.email,
            auth0Id: user.auth0_id ?? undefined,
            language: user.language,
            descoId: user.desco_id,
            lastLoginAt: user.last_login_at !== null ? DateTime.fromISO(user.last_login_at, { zone: 'utc' }) : undefined,
            descoName: desco.name,
            descoUrlSlug: desco.urlSlug
        }
    }
}
