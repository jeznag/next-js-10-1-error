import { InsightApi, InsightDTO, Insight, BatchedInsight } from '@apollo'
import { HttpClient } from '@services'
import { expectHttpResponses, expectHttpPostResponses } from '@utils'

describe('Testing InsightApi class', () => {
    let insightApi: InsightApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        insightApi = new InsightApi(httpMock)
    })

    describe('getAllFromLastFiveDays', () => {
        it('should fetch all insights for provided parameters', async () => {
            const fakeInsightsForVillageOne: InsightDTO[] = [{
                timestamp: 1590980174811,
                node_id: 1,
                rule_id: 1,
                village_id: 1,
                triggered_rule_ids: [1]
            }, {
                timestamp: 1590980174812,
                node_id: 2,
                rule_id: 2,
                village_id: 1,
                triggered_rule_ids: [1, 2, 3]
            }]

            const fakeInsightsForVillageTwo: InsightDTO[] = [{
                timestamp: 1590980174813,
                node_id: 3,
                rule_id: 3,
                village_id: 2,
                triggered_rule_ids: [4, 5, 6]
            }, {
                timestamp: 1590980174814,
                node_id: 4,
                rule_id: 4,
                village_id: 2,
                triggered_rule_ids: [7, 8, 9]
            }, {
                timestamp: 1590980174815,
                node_id: 5,
                rule_id: 5,
                village_id: 2,
                triggered_rule_ids: [3, 4, 5]
            }]

            const expectedInsights: Insight[] = [{
                timestamp: 1590980174811,
                nodeId: 1,
                ruleId: 1,
                villageId: 1,
                triggeredRuleIds: [1]
            }, {
                timestamp: 1590980174812,
                nodeId: 2,
                ruleId: 2,
                villageId: 1,
                triggeredRuleIds: [1, 2, 3]
            }, {
                timestamp: 1590980174813,
                nodeId: 3,
                ruleId: 3,
                villageId: 2,
                triggeredRuleIds: [4, 5, 6]
            }, {
                timestamp: 1590980174814,
                nodeId: 4,
                ruleId: 4,
                villageId: 2,
                triggeredRuleIds: [7, 8, 9]
            }, {
                timestamp: 1590980174815,
                nodeId: 5,
                ruleId: 5,
                villageId: 2,
                triggeredRuleIds: [3, 4, 5]
            }]

            expectHttpResponses<InsightDTO>([[...fakeInsightsForVillageOne, ...fakeInsightsForVillageTwo]])
            const actualInsights = await insightApi.getAllFromLastFiveDays([10, 11])

            expect(actualInsights).toStrictEqual(expectedInsights)
        })

        it('should throw an error if fetching insights fails', async () => {
            const insightError = new Error('bad connection')

            expectHttpResponses([insightError])

            const actualInsights = await insightApi.getAllFromLastFiveDays([10])

            expect(actualInsights).toBeInstanceOf(Error)
        })
    })

    describe('dismiss', () => {
        let mockInsightToDismiss: BatchedInsight

        beforeEach(() => {
            mockInsightToDismiss = {
                rule: { ruleId: 13 },
                villageId: 1
            }
        })
        it('should correctly return nothing when dismiss an insight', async () => {
            expectHttpPostResponses([''])

            const response = await insightApi.dismiss(mockInsightToDismiss, 0)
            expect(response).toEqual('')
        })

        it('should throw an error if dismissing insight fails', async () => {
            const insightError = new Error('bad connection')

            expectHttpPostResponses([insightError])

            const response = await insightApi.dismiss(mockInsightToDismiss, 0)

            expect(response).toBeInstanceOf(Error)
        })
    })
})
