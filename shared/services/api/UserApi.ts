import { DateTime } from 'luxon'
import { ObjectUtil } from '@utils'
import { Dictionary, Condition } from '@shared-types'

import { XMysqlApi } from './'
import { HttpClient } from '@services'

type UserDTO = {
    user_pk: number
    email: string
    auth0_id: string | null
    desco_fk: number
    language?: SupportedLanguageCodes
    last_login_at: string | null
    is_deleted: number
}

export enum SupportedLanguageCodes {
    English = 'en',
    Khmer = 'km',
    Tagalog = 'tl'
}

export type UserDTOWithDescoName = UserDTO & {
    name: string
    url_slug: string
}

export type ExternalUser = {
    userPk: number
    email: string
    auth0Id?: string
    descoFk: number
    language?: SupportedLanguageCodes
    lastLoginAt?: DateTime
    descoName: string
    descoUrlSlug: string
}

export class UserApi {
    private readonly baseApi: XMysqlApi<UserDTO>
    private readonly fields = [
        'user_pk',
        'email',
        'auth0_id',
        'desco_fk',
        'last_login_at',
        'is_deleted'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<UserDTO>('user', this.fields, client)
    }

    public async getUserFromEmail (email: string, includeDeletedUsers = false): Promise<ExternalUser | undefined | Error> {
        const users = await this.getUsers({ email }, includeDeletedUsers)

        if (users instanceof Error) return users

        const user = users[0]

        return (user !== undefined)
            ? user
            : undefined
    }

    public async getUsersFromDesco (descoKey: number): Promise<ExternalUser[] | Error> {
        return this.getUsers({ desco_fk: `${descoKey}` })
    }

    public async getUsers (condition?: Condition, includeDeletedUsers = false): Promise<ExternalUser[] | Error> {
        const defaultCondition = { ...condition }
        if (!includeDeletedUsers) defaultCondition.is_deleted = 0
        const parsedCondition = this.baseApi.parseCondition(defaultCondition, 'u')

        const dataForJoin = {
            _join: 'u.user,_j,d.desco',
            _on1: '(u.desco_fk,eq,d.desco_pk)',
            _fields: [
                ...this.fields.map(field => `u.${field}`),
                'd.name',
                'd.url_slug'
            ].join(','),
            ...(parsedCondition && !ObjectUtil.isEmpty(parsedCondition)) && parsedCondition
        }

        const users = await this.baseApi.getJoin<UserDTOWithDescoName>(dataForJoin)

        if (users instanceof Error) return users

        return users.map(userDto => this.parseUserDTO(userDto))
    }

    public async updateUsersLastLogin (userKey: number): Promise<boolean | Error> {
        const data = { last_login_at: DateTime.utc().toISO() }

        return this.baseApi.updateFromKey(userKey, data)
    }

    public async createUser (email: string, descoFk: number, auth0Id: string): Promise<number | Error> {
        return this.baseApi.insert({
            email: email,
            desco_fk: descoFk,
            auth0_id: auth0Id
        })
    }

    public async deleteUser (userKey: number): Promise<boolean | Error> {
        const data = { is_deleted: 1 }

        return this.baseApi.updateFromKey(userKey, data)
    }

    /**
     * This would permanently delete the user from the database.
     * Only use this for test user clean-up.
     * @param userKey
     */
    public async permanentlyDeleteUser (userKey: number): Promise<boolean | Error> {
        return this.baseApi.deleteFromKey(userKey)
    }

    private parseUserDTO (dto: UserDTOWithDescoName): ExternalUser {
        return {
            userPk: dto.user_pk,
            email: dto.email,
            auth0Id: dto.auth0_id ?? undefined,
            language: dto.language,
            descoFk: dto.desco_fk,
            lastLoginAt: dto.last_login_at !== null ? DateTime.fromISO(dto.last_login_at, { zone: 'utc' }) : undefined,
            descoName: dto.name,
            descoUrlSlug: dto.url_slug
        }
    }

    public static buildUserDict (users: ExternalUser[]) {
        const resultDict: Dictionary<ExternalUser> = {}

        for (const user of users) {
            if (resultDict[user.userPk] === undefined) {
                resultDict[user.userPk] = user
            }
        }

        return resultDict
    }
}
