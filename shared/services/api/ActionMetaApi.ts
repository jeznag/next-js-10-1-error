import { Dictionary } from '@shared-types'

import { HttpClient } from '@services'
import { XMysqlApi } from './'

export type ActionMetaDTO = {
    action_meta_pk: number,
    action_fk: number,
    rule_fk: number | null,
    node_fk: number | null
}

export type ActionMeta = {
    actionMetaPk: number
    ruleFk?: number
    nodeFk?: number
}

export type ActionMetaParams = {
    actionPk: number
    rulePk?: number
    nodePk?: number
}

export class ActionMetaApi {
    private readonly baseApi: XMysqlApi<ActionMetaDTO>
    private readonly fields = [
        'action_meta_pk',
        'action_fk',
        'rule_fk',
        'node_fk'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<ActionMetaDTO>('action_meta', this.fields, client)
    }

    public async getAllMeta (actionPks: number[]): Promise<Dictionary<ActionMeta[]> | Error> {
        const condition = { _where: `(action_fk,in,${actionPks.join(',')})` }
        const response = await this.baseApi.getAll(condition)
        if (response instanceof Error) return response

        const resultDict: Dictionary<ActionMeta[]> = {}

        for (const metaDto of response) {
            const meta = this.parseMetaDTO(metaDto)
            // We need to check if the array has been initialised
            const initialisedArray = resultDict[metaDto.action_fk] !== undefined
                ? resultDict[metaDto.action_fk]
                : []
            initialisedArray.push(meta)
            resultDict[metaDto.action_fk] = initialisedArray
        }

        return resultDict
    }

    public async createMeta (metaParams: ActionMetaParams): Promise<number | Error> {
        return this.baseApi.insert({
            action_fk: metaParams.actionPk,
            rule_fk: metaParams.rulePk,
            node_fk: metaParams.nodePk
        })
    }

    public async createMetas (metaParamsArray: ActionMetaParams[]): Promise<number | Error> {
        const bulkInsertParams = metaParamsArray.map(metaParams => ({
            action_fk: metaParams.actionPk,
            rule_fk: metaParams.rulePk,
            node_fk: metaParams.nodePk
        }))

        return this.baseApi.bulkInsert(bulkInsertParams)
    }

    public async deleteMetas (actionMetaKeys: number[]): Promise<boolean | Error> {
        return this.baseApi.bulkDelete(actionMetaKeys)
    }

    public async deleteMeta (actionMetaKey: number): Promise<boolean | Error> {
        return this.baseApi.deleteFromKey(actionMetaKey)
    }

    public async deleteMostRecentMeta (): Promise<boolean | Error> {
        const meta = await this.baseApi.get({ _sort: '-created_at' }, 1)
        if (meta instanceof Error) return meta
        if (meta.length > 0) {
            return this.baseApi.deleteFromKey(meta[0].action_meta_pk)
        }
        return true
    }

    private parseMetaDTO (metaDto: ActionMetaDTO): ActionMeta {
        return {
            actionMetaPk: metaDto.action_meta_pk,
            ruleFk: metaDto.rule_fk ?? undefined,
            nodeFk: metaDto.node_fk ?? undefined
        }
    }
}
