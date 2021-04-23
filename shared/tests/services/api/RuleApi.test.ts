import { HttpClient } from '@services'
import { expectHttpResponses } from '@utils'
import {
    RuleDTO,
    RuleApi,
    RuleType,
    RulePriority,
    Rules
} from '@api'

describe('RuleApi', () => {
    let mockRules: RuleDTO[]
    let rulesApi: RuleApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        rulesApi = new RuleApi(httpMock)
        mockRules = [{
            rule_pk: 1,
            name: 'Battery SoC Dissipating (24hr)',
            class_name: 'BatterySocDissipatingRuleDeprecated',
            external_name: '',
            period_hrs: 24,
            threshold: -0.3,
            village_wide: 0,
            priority: RulePriority.Minor,
            visibility: 'EXTERNAL',
            deprecated: 1,
            insight: 0
        }, {
            rule_pk: 19,
            name: 'Check Battery',
            class_name: 'CheckBatteryInsight',
            external_name: '',
            period_hrs: 0,
            threshold: 0,
            village_wide: 0,
            priority: RulePriority.Minor,
            visibility: 'EXTERNAL',
            deprecated: 0,
            insight: 1
        }, {
            rule_pk: 18,
            name: 'Cell Network Outage',
            class_name: 'CellNetworkOutageInsight',
            external_name: '',
            period_hrs: 0,
            threshold: 0,
            village_wide: 1,
            priority: RulePriority.Minor,
            visibility: 'EXTERNAL',
            deprecated: 0,
            insight: 1
        }, {
            rule_pk: 13,
            name: 'Village Wide No Data Received',
            class_name: 'VillageWideNoDataReceivedRule',
            external_name: '',
            period_hrs: 12,
            threshold: 0.75,
            village_wide: 1,
            priority: RulePriority.Major,
            visibility: 'EXTERNAL',
            deprecated: 0,
            insight: 0
        }]
    })

    describe('getAllRules', () => {
        it('should retrieve all rules segregated by rule type', async () => {
            const ruleCount = [
                {
                    no_of_rows: 4
                }
            ]
            expectHttpResponses([ruleCount, mockRules])
            const expectedRules: Rules = {
                nodeAlerts: [{
                    rulePk: 1,
                    name: 'Battery SoC Dissipating (24hr)',
                    className: 'BatterySocDissipatingRuleDeprecated',
                    externalName: '',
                    periodHrs: 24,
                    threshold: -0.3,
                    visibility: 'EXTERNAL',
                    priority: RulePriority.Minor,
                    type: RuleType.NodeAlert
                }],
                nodeInsights: [{
                    rulePk: 19,
                    name: 'Check Battery',
                    className: 'CheckBatteryInsight',
                    externalName: '',
                    periodHrs: 0,
                    threshold: 0,
                    visibility: 'EXTERNAL',
                    priority: RulePriority.Minor,
                    type: RuleType.NodeInsight
                }],
                villageAlerts: [{
                    rulePk: 13,
                    name: 'Village Wide No Data Received',
                    className: 'VillageWideNoDataReceivedRule',
                    externalName: '',
                    periodHrs: 12,
                    threshold: 0.75,
                    visibility: 'EXTERNAL',
                    priority: RulePriority.Major,
                    type: RuleType.VillageAlert
                }],
                villageInsights: [{
                    rulePk: 18,
                    name: 'Cell Network Outage',
                    className: 'CellNetworkOutageInsight',
                    externalName: '',
                    periodHrs: 0,
                    threshold: 0,
                    visibility: 'EXTERNAL',
                    priority: RulePriority.Minor,
                    type: RuleType.VillageInsight
                }]
            }

            const actualRules = await rulesApi.getAllRules()
            expect(actualRules).toStrictEqual(expectedRules)
        })

        it('should return an error if the http client fails', async () => {
            expectHttpResponses([new Error('bad connection')])
            const actualResult = await rulesApi.getAllRules()
            expect(actualResult).toBeInstanceOf(Error)
        })
    })
})
