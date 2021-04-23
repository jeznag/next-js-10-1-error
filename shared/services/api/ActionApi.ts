import { DateTime } from 'luxon'

import { HttpClient } from '@services'
import { ActionMeta, XMysqlApi } from './'

export enum ActionStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED'
}

export enum ActionResolution {
    NONE = 'NONE',
    REPLACE_PANEL = 'REPLACE_PANEL',
    REPLACE_BATTERY = 'REPLACE_BATTERY',
    REPLACE_POD = 'REPLACE_POD',
    FIX_WIRING = 'FIX_WIRING',
    OTHER = 'OTHER'
}

export const ActionResolutionText = {
    [ActionResolution.NONE]: 'No action taken',
    [ActionResolution.REPLACE_PANEL]: 'Changed panel',
    [ActionResolution.REPLACE_BATTERY]: 'Changed battery',
    [ActionResolution.REPLACE_POD]: 'Replaced Pod',
    [ActionResolution.FIX_WIRING]: 'Fixed wiring',
    [ActionResolution.OTHER]: 'Other'
}

export type ActionDTO = {
    action_pk: number
    village_fk: number
    title: string
    description: string | null
    user_fk: number | null
    status: ActionStatus
    opened_at: string
    closed_at: string | null
    resolution: ActionResolution | null
    updated_at: string
}

export type Action = {
    actionPk: number
    villageFk: number
    title: string
    description?: string
    userFk?: number
    userName?: string
    status: ActionStatus
    openedAt: DateTime
    closedAt?: DateTime
    resolution?: ActionResolution
    updatedAt: DateTime
    meta?: ActionMeta[]
}

export type UpdatableActionParams = {
    title?: string
    description?: string | null
    assignee?: number | null
    status?: ActionStatus
    resolution?: ActionResolution
}

export class ActionApi {
    private readonly baseApi: XMysqlApi<ActionDTO>
    private readonly fields = [
        'action_pk',
        'village_fk',
        'title',
        'description',
        'user_fk',
        'status',
        'opened_at',
        'closed_at',
        'resolution',
        'updated_at'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<ActionDTO>('action', this.fields, client)
    }

    public async getAllActions (villagePks: number[]): Promise<Action[] | Error> {
        const condition = { _where: `(village_fk,in,${villagePks.join(',')})` }
        const actions = await this.baseApi.getAll(condition)

        if (actions instanceof Error) return actions

        return actions.map(actionDto => this.parseActionDTO(actionDto))
    }

    public async createAction (
        villageKey: number,
        title: string,
        description?: string,
        userKey?: number
    ): Promise<number | Error> {
        return this.baseApi.insert({
            village_fk: villageKey,
            title: title,
            description: description,
            user_fk: userKey,
            status: ActionStatus.OPEN,
            opened_at: DateTime.utc().toISO()
        })
    }

    public async deleteAction (actionPk: number): Promise<boolean | Error> {
        return this.baseApi.deleteFromKey(actionPk)
    }

    public async getMostRecentAction (): Promise<Action | Error | undefined> {
        const action = await this.baseApi.get({ _sort: '-created_at' }, 1)

        if (action instanceof Error) return action

        return action[0]
            ? this.parseActionDTO(action[0])
            : undefined
    }

    public async getFromKey (actionKey: number): Promise<Action | Error | undefined> {
        const action = await this.baseApi.getFromKey(actionKey)

        if (action instanceof Error) return action

        return action
            ? this.parseActionDTO(action)
            : undefined
    }

    public async isInsightAlreadyLinked (rulePk: number, villagePk: number, nodePk?: number): Promise<boolean | Error> {
        const whereClause = [
            `(a.village_fk,eq,${villagePk})`,
            `(a.status,ne,${ActionStatus.CLOSED})`,
            `(m.rule_fk,eq,${rulePk})`,
            `(m.node_fk,eq,${nodePk ?? 'null'})`
        ].join('~and')

        const condition = {
            _join: 'a.action,_j,m.action_meta',
            _on1: '(a.action_pk,eq,m.action_fk)',
            _where: whereClause,
            _size: 1
        }

        const result = await this.baseApi.getJoin(condition)

        if (result instanceof Error) return result

        return (result.length > 0)
    }

    public async updateAction (
        actionKey: number,
        updatedActionParams: UpdatableActionParams
    ): Promise<boolean | Error> {
        const closedAt = (
            updatedActionParams.status &&
            updatedActionParams.status === ActionStatus.CLOSED
        )
            ? DateTime.utc().toISO()
            : undefined

        const actionData = {
            title: updatedActionParams.title,
            description: updatedActionParams.description,
            user_fk: updatedActionParams.assignee,
            status: updatedActionParams.status,
            closed_at: closedAt,
            resolution: updatedActionParams.resolution
        }

        return this.baseApi.updateFromKey(
            actionKey,
            actionData
        )
    }

    private parseActionDTO (actionDto: ActionDTO): Action {
        return {
            actionPk: actionDto.action_pk,
            villageFk: actionDto.village_fk,
            title: actionDto.title,
            description: actionDto.description ?? undefined,
            userFk: actionDto.user_fk ?? undefined,
            status: actionDto.status,
            openedAt: DateTime.fromISO(actionDto.opened_at, { zone: 'utc' }),
            closedAt: actionDto.closed_at !== null ? DateTime.fromISO(actionDto.closed_at, { zone: 'utc' }) : undefined,
            resolution: actionDto.resolution ?? undefined,
            updatedAt: DateTime.fromISO(actionDto.updated_at, { zone: 'utc' })
        }
    }
}
