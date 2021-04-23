import { DateTime } from 'luxon'

import { Condition } from '@shared-types'
import { XMysqlApi } from '@api'
import { HttpClient } from '@services'

export type AggregationDTO = {
    agg_pk: number
    consumer_pk: number
    village_pk: number
    percent_system_uptime: number | null
    date: string
}

export type Aggregation = {
    aggPk: number
    consumerPk: number
    villagePk: number
    percentSystemUptime?: number
    date: string
}

export class AggregationsApi {
    private readonly baseApi: XMysqlApi<AggregationDTO>
    private readonly fields = [
        'agg_pk',
        'consumer_pk',
        'village_pk',
        'percent_system_uptime',
        'date'
    ]

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new XMysqlApi<AggregationDTO>('aggregations', this.fields, client)
    }

    /*
    * Get all aggregations for provided consumers.
    * Default to most recent 1 day of data, optional parameter for data range
    */
    public async getAllFromVillages (villageKeys: number[], fromDate?: string): Promise<Aggregation[] | Error> {
        if (villageKeys.length <= 0) return []

        const uniqueKeys = [...new Set(villageKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        const conditions = {
            village_pk: stringOfKeys,
            date: fromDate ?? DateTime.utc().minus({ days: 1 }).toFormat('yyyy-MM-dd')
        }

        return this.getAllAggregations(conditions)
    }

    private async getAllAggregations (condition?: Condition): Promise<Aggregation[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition)
            : undefined

        const aggregations = await this.baseApi.getAllWithCustomEntity<AggregationDTO>({
            _fields: this.fields.join(','),
            ...parsedCondition
        }, 'aggregations_view')

        if (aggregations instanceof Error) {
            return aggregations
        }

        return aggregations.map(agg => this.parseAggregationsDto(agg))
    }

    private parseAggregationsDto (dto: AggregationDTO): Aggregation {
        return {
            aggPk: dto.agg_pk,
            consumerPk: dto.consumer_pk,
            villagePk: dto.village_pk,
            percentSystemUptime: dto.percent_system_uptime ?? undefined,
            date: dto.date
        }
    }
}
