import { HttpClient } from '@services'
import {
    expectHttpResponses,
    expectHttpPostResponses,
    expectHttpDeleteResponses
} from '@utils'

import {
    ActionMetaApi,
    ActionMetaDTO,
    ActionMeta,
    ActionMetaParams
} from '@api'

describe('Testing ActionMetaApi class', () => {
    let metaApi: ActionMetaApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        metaApi = new ActionMetaApi(httpMock)
    })

    describe('getAllMeta()', () => {
        it('should return action meta in expected dictionary format', async () => {
            const actionPkOne = 1
            const actionPkTwo = 2
            const actionPkThree = 3

            const mockMetaOne: ActionMetaDTO[] = [
                {
                    action_meta_pk: 111,
                    action_fk: actionPkOne,
                    rule_fk: 11,
                    node_fk: 22
                },
                {
                    action_meta_pk: 222,
                    action_fk: actionPkOne,
                    rule_fk: 33,
                    node_fk: 44
                }
            ]
            const mockMetaTwo: ActionMetaDTO[] = [
                {
                    action_meta_pk: 333,
                    action_fk: actionPkTwo,
                    rule_fk: 55,
                    node_fk: 66
                },
                {
                    action_meta_pk: 444,
                    action_fk: actionPkTwo,
                    rule_fk: 77,
                    node_fk: 88
                }
            ]
            const mockMetaThree: ActionMetaDTO[] = [
                {
                    action_meta_pk: 555,
                    action_fk: actionPkThree,
                    rule_fk: 99,
                    node_fk: 12
                },
                {
                    action_meta_pk: 666,
                    action_fk: actionPkThree,
                    rule_fk: 34,
                    node_fk: 56
                }
            ]

            const expectedData = mockMetaTwo.concat(mockMetaOne).concat(mockMetaThree)
            const mockPageCountResponse = [{ no_of_rows: expectedData.length }]

            expectHttpResponses([mockPageCountResponse, expectedData])

            const actualResult = await metaApi.getAllMeta([actionPkOne, actionPkTwo])
            if (actualResult instanceof Error) throw actualResult

            const expectDataMatches = (actualData: ActionMeta[], mockData: ActionMetaDTO[]) => {
                for (let i = 0; i < mockData.length; i++) {
                    expect(actualData[i].actionMetaPk).toStrictEqual(mockData[i].action_meta_pk)
                    expect(actualData[i].ruleFk).toStrictEqual(mockData[i].rule_fk ?? undefined)
                    expect(actualData[i].nodeFk).toStrictEqual(mockData[i].node_fk ?? undefined)
                }
            }

            expectDataMatches(actualResult[actionPkOne], mockMetaOne)
            expectDataMatches(actualResult[actionPkTwo], mockMetaTwo)
            expectDataMatches(actualResult[actionPkThree], mockMetaThree)
        })

        it('should return an error if the http client fails', async () => {
            expectHttpResponses([new Error('bad connection')])
            const actionPk = 1
            const actualResult = await metaApi.getAllMeta([actionPk])
            expect(actualResult).toBeInstanceOf(Error)
        })
    })

    describe('createMeta()', () => {
        let actionMetaParams: ActionMetaParams

        beforeEach(() => {
            actionMetaParams = {
                actionPk: 1,
                rulePk: 2,
                nodePk: 3
            }
        })

        it('should return the new meta pk', async () => {
            const expectedResponse = { affectedRows: 1, insertId: 200 }

            expectHttpPostResponses([expectedResponse])

            const actualResult = await metaApi.createMeta(actionMetaParams)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toStrictEqual(expectedResponse.insertId)
        })

        it('should return an error if no rows where affected', async () => {
            const expectedResponse = { affectedRows: 0, insertId: 0 }

            expectHttpPostResponses([expectedResponse])

            const actualResult = await metaApi.createMeta(actionMetaParams)
            expect(actualResult).toBeInstanceOf(Error)
        })

        it('should return an error if the http client fails', async () => {
            expectHttpPostResponses([new Error('bad connection')])

            const actualResult = await metaApi.createMeta(actionMetaParams)
            expect(actualResult).toBeInstanceOf(Error)
        })
    })

    describe('createMetas()', () => {
        let actionMetaParams: ActionMetaParams[]

        beforeEach(() => {
            actionMetaParams = [{
                actionPk: 2,
                nodePk: 3
            }, {
                actionPk: 2,
                nodePk: 4
            }]
        })

        it('should return the new meta pk', async () => {
            const expectedResponse = { affectedRows: 2, insertId: 200 }

            expectHttpPostResponses([expectedResponse])

            const actualResult = await metaApi.createMetas(actionMetaParams)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toStrictEqual(2)
        })

        it('should return an error if no rows where affected', async () => {
            const expectedResponse = { affectedRows: 0, insertId: 0 }

            expectHttpPostResponses([expectedResponse])

            const actualResult = await metaApi.createMetas(actionMetaParams)
            expect(actualResult).toBeInstanceOf(Error)
        })

        it('should return an error if the http client fails', async () => {
            expectHttpPostResponses([new Error('bad connection')])

            const actualResult = await metaApi.createMetas(actionMetaParams)
            expect(actualResult).toBeInstanceOf(Error)
        })
    })

    describe('deleteMeta()', () => {
        it('should return true if successful', async () => {
            const metaPk = 2
            const expectedResponse = { affectedRows: 1, insertId: 0 }

            expectHttpDeleteResponses([expectedResponse])

            const actualResult = await metaApi.deleteMeta(metaPk)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(true)
        })

        it('should return false if no rows where affected', async () => {
            const metaPk = 2
            const expectedResponse = { affectedRows: 0, insertId: 0 }

            expectHttpDeleteResponses([expectedResponse])

            const actualResult = await metaApi.deleteMeta(metaPk)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(false)
        })

        it('should return an error if the http client fails', async () => {
            const metaPk = 2
            expectHttpDeleteResponses([new Error('bad connection')])

            const actualResult = await metaApi.deleteMeta(metaPk)
            expect(actualResult).toBeInstanceOf(Error)
        })
    })
})
