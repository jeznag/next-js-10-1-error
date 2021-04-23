import { Dictionary } from '@shared-types'

import { XMysqlApi } from './'
import { HttpClient } from '@services'

export enum RulePriority {
    Minor = 'Minor',
    Trivial = 'Trivial',
    Medium = 'Medium',
    Major = 'Major',
    Critical = 'Critical'
}

export enum RuleType {
    VillageInsight = 'VillageInsight',
    VillageAlert = 'VillageAlert',
    NodeInsight = 'NodeInsight',
    NodeAlert = 'NodeAlert'
}

type NodeAlert = Rule<RuleType.NodeAlert>
type NodeInsight = Rule<RuleType.NodeInsight>
type VillageAlert = Rule<RuleType.VillageAlert>
type VillageInsight = Rule<RuleType.VillageInsight>

export type RuleDTO = {
    rule_pk: number,
    name: string
    class_name: string
    external_name: string
    period_hrs: number
    threshold: number
    village_wide: 1 | 0
    priority: RulePriority
    visibility: string
    deprecated: number
    insight: 1 | 0
}

export type Rules = {
    nodeAlerts: readonly NodeAlert[]
    nodeInsights: readonly NodeInsight[]
    villageAlerts: readonly VillageAlert[]
    villageInsights: readonly VillageInsight[]
}

export type Rule<T = RuleType> = {
    rulePk: number
    name: string
    className: string
    externalName: string
    periodHrs: number
    threshold: number
    priority: RulePriority
    visibility: string
    type: T
}

export enum RuleVisibility {
    EXTERNAL = 'EXTERNAL',
    INTERNAL = 'INTERNAL'
}

export const PriorityRating = {
    [RulePriority.Minor]: 6,
    [RulePriority.Trivial]: 5,
    [RulePriority.Medium]: 3,
    [RulePriority.Major]: 2,
    [RulePriority.Critical]: 1
}

export class RuleApi {
    private readonly baseApi: XMysqlApi<RuleDTO>
    private readonly fields = [
        'rule_pk',
        'name',
        'class_name',
        'external_name',
        'period_hrs',
        'threshold',
        'village_wide',
        'priority',
        'visibility',
        'deprecated',
        'insight'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<RuleDTO>('rule', this.fields, client)
    }

    public async getAllRules (): Promise<Rules | Error> {
        const results = await this.baseApi.getAll({ _where: '(deprecated,eq,0)' })
        const nodeAlerts: NodeAlert[] = []
        const nodeInsights: NodeInsight[] = []
        const villageAlerts: VillageAlert[] = []
        const villageInsights: VillageInsight[] = []

        if (results instanceof Error) {
            return results
        }

        for (const result of results) {
            if (result.village_wide && result.insight) {
                villageInsights.push(
                    this.parseDto(result, RuleType.VillageInsight)
                )
            } else if (result.village_wide && !result.insight) {
                villageAlerts.push(
                    this.parseDto(result, RuleType.VillageAlert)
                )
            } else if (!result.village_wide && result.insight) {
                nodeInsights.push(
                    this.parseDto(result, RuleType.NodeInsight)
                )
            } else {
                nodeAlerts.push(
                    this.parseDto(result, RuleType.NodeAlert)
                )
            }
        }

        return {
            nodeAlerts,
            nodeInsights,
            villageAlerts,
            villageInsights
        }
    }

    public static getVisibilityLevels (allRules: Rules): string[] {
        const visibilityLevels = Object
            .values(allRules)
            .flatMap(rules =>
                [...(rules as Rule<RuleType>[])
                    .map(rule => rule.visibility)]
            )

        return [...new Set(visibilityLevels)]
    }

    private parseDto<T extends RuleType> (ruleDto: RuleDTO, ruleType: T): Rule<T> {
        return {
            rulePk: ruleDto.rule_pk,
            name: ruleDto.name,
            className: ruleDto.class_name,
            externalName: ruleDto.external_name,
            periodHrs: ruleDto.period_hrs,
            threshold: ruleDto.threshold,
            priority: ruleDto.priority,
            visibility: ruleDto.visibility,
            type: ruleType
        }
    }

    public static buildRuleDict (validRules: Rules): Dictionary<Rule<RuleType>> {
        const rulesDict: Dictionary<Rule> = {}

        for (const rules of Object.values(validRules)) {
            for (const rule of rules) {
                rulesDict[rule.rulePk] = rule
            }
        }

        return rulesDict
    }
}
