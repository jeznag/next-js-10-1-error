import { ApolloApi } from './ApolloApi'
import { HttpClient } from '@services'
import { DateTime } from 'luxon'

// WARN: Other services rely on this enum/order, so you can only append new reasons.
// This is the source of truth.
enum DismissReasonKey {
    InvalidInsight,
    NotEnoughInformation,
    TooLowPriority,
    ExternallyDismissed
}

export type BatchedInsight = {
    rule: { ruleId: number }
    node?: { nodeId: number }
    villageId: number
}

export type InsightDTO = {
    timestamp: number,
    rule_id: number,
    village_id: number,
    node_id: number | null
    triggered_rule_ids: Array<number>,
    dismissed_reason?: DismissReasonKey
    action_id?: number
}

export type InsightReqParam = {
    village_id: number
    start_ts: number
    end_ts: number
}

export type InsightDismissPostBody = {
    rule_id: number
    dismissed_reason: DismissReasonKey
    village_id: number
    node_id: number | undefined
}

export type InsightActionPostBody = {
    rule_id: number
    action_id: number
    village_id: number
    node_id: number | undefined
}

export type Insight = {
    timestamp: number,
    nodeId?: number,
    villageId: number,
    ruleId: number,
    triggeredRuleIds: number[]
}

export class InsightApi {
    private readonly baseApi: ApolloApi<InsightDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('insights', client)
    }

    private async getAll (
        villageIds: number[],
        timestampStart: number,
        timestampEnd: number
    ): Promise<Insight[] | Error> {
        const uniqueIds = [...new Set(villageIds)].join(',')

        const requestParams = {
            village_ids: uniqueIds,
            start_ts: timestampStart,
            end_ts: timestampEnd
        }

        const results = await this.baseApi.getAll(requestParams)

        if (results instanceof Error) {
            return results
        }

        return results.map(result => this.parseDto(result))
    }

    public async getAllFromLastFiveDays (villageIds: number[]) {
        const timestampEnd = DateTime.local().toMillis()
        // today, is the fifth day, so the start of the first day is at midnight, 4 days ago
        const timestampStart = DateTime.local().minus({ days: 4 }).startOf('day').toMillis()

        return this.getAll(villageIds, timestampStart, timestampEnd)
    }

    public async dismiss (insight: BatchedInsight, reason: DismissReasonKey) {
        const requestBody: InsightDismissPostBody = {
            rule_id: insight.rule.ruleId,
            dismissed_reason: reason,
            village_id: insight.villageId,
            node_id: insight.node?.nodeId
        }
        return this.baseApi.create<undefined>(requestBody)
    }

    public async action (insight: BatchedInsight, actionId: number) {
        const requestBody: InsightActionPostBody = {
            rule_id: insight.rule.ruleId,
            action_id: actionId,
            village_id: insight.villageId,
            node_id: insight.node?.nodeId
        }
        return this.baseApi.create(requestBody)
    }

    private parseDto (dto: InsightDTO): Insight {
        return {
            timestamp: dto.timestamp,
            nodeId: dto.node_id ?? undefined,
            villageId: dto.village_id,
            ruleId: dto.rule_id,
            triggeredRuleIds: dto.triggered_rule_ids
        }
    }
}
