import { DateTime } from 'luxon'
import { HttpClient } from '@services'
import {
    expectHttpResponses,
    expectHttpPostResponses,
    expectHttpPatchResponses,
    expectHttpDeleteResponses
} from '@utils'
import { ActionApi, ActionStatus, ActionDTO } from '@api'

describe('Testing ActionApi class', () => {
    let actionApi: ActionApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        actionApi = new ActionApi(httpMock)
    })

    describe('getAllActions()', () => {
        it('should return actions in expected format', async () => {
            const villagePk = 1
            const mockActions: ActionDTO[] = [
                {
                    action_pk: 222,
                    village_fk: villagePk,
                    title: 'Fix all the things',
                    description: 'Everything is broken and needs fixing',
                    user_fk: null,
                    status: ActionStatus.OPEN,
                    opened_at: '2020-05-06T01:37:27.000Z',
                    closed_at: null,
                    resolution: null,
                    updated_at: '2020-05-06T01:37:27.000Z'
                },
                {
                    action_pk: 333,
                    village_fk: villagePk,
                    title: 'Fix all the things',
                    description: 'Everything is broken and needs fixing',
                    user_fk: null,
                    status: ActionStatus.OPEN,
                    opened_at: '2020-05-06T01:37:27.000Z',
                    closed_at: null,
                    resolution: null,
                    updated_at: '2020-05-06T01:37:27.000Z'
                }
            ]
            const mockPageCountResponse = [{ no_of_rows: mockActions.length }]

            expectHttpResponses([mockPageCountResponse, mockActions])

            const actualResult = await actionApi.getAllActions([villagePk])
            if (actualResult instanceof Error) throw actualResult

            for (let i = 0; i < mockActions.length; i++) {
                expect(actualResult[i]?.actionPk).toStrictEqual(mockActions[i].action_pk)
                expect(actualResult[i]?.villageFk).toStrictEqual(mockActions[i].village_fk)
                expect(actualResult[i]?.title).toStrictEqual(mockActions[i].title)
                expect(actualResult[i]?.description).toStrictEqual(mockActions[i].description ?? undefined)
                expect(actualResult[i]?.status).toStrictEqual(mockActions[i].status)
                expect(actualResult[i]?.openedAt).toEqual(DateTime.fromISO(mockActions[i].opened_at, { zone: 'utc' }))
                expect(actualResult[i]?.closedAt).toBeUndefined()
                expect(actualResult[i]?.meta).toBeUndefined()
            }
        })

        it('should return an error if the http client fails', async () => {
            expectHttpResponses([new Error('bad connection')])
            const villagePk = 2
            const actualResult = await actionApi.getAllActions([villagePk])
            expect(actualResult).toBeInstanceOf(Error)
        })
    })

    describe('createAction()', () => {
        it('should return the new actions pk', async () => {
            const villagePk = 2
            const expectedResponse = { affectedRows: 1, insertId: 200 }

            expectHttpPostResponses([expectedResponse])

            const actualResult = await actionApi.createAction(villagePk, 'title', 'description')
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toStrictEqual(expectedResponse.insertId)
        })

        it('should return an error if no rows where affected', async () => {
            const villagePk = 2
            const expectedResponse = { affectedRows: 0, insertId: 0 }

            expectHttpPostResponses([expectedResponse])

            const actualResult = await actionApi.createAction(villagePk, 'title', 'description')
            expect(actualResult).toBeInstanceOf(Error)
        })

        it('should return an error if the http client fails', async () => {
            const villagePk = 2
            expectHttpPostResponses([new Error('bad connection')])

            const actualResult = await actionApi.createAction(villagePk, 'title', 'description')
            expect(actualResult).toBeInstanceOf(Error)
        })
    })

    describe('deleteAction()', () => {
        it('should return true if successful', async () => {
            const actionPk = 2
            const expectedResponse = { affectedRows: 1, insertId: 0 }

            expectHttpDeleteResponses([expectedResponse])

            const actualResult = await actionApi.deleteAction(actionPk)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(true)
        })

        it('should return false if no rows where affected', async () => {
            const actionPk = 2
            const expectedResponse = { affectedRows: 0, insertId: 0 }

            expectHttpDeleteResponses([expectedResponse])

            const actualResult = await actionApi.deleteAction(actionPk)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(false)
        })

        it('should return an error if the http client fails', async () => {
            const actionPk = 2
            expectHttpDeleteResponses([new Error('bad connection')])

            const actualResult = await actionApi.deleteAction(actionPk)
            expect(actualResult).toBeInstanceOf(Error)
        })
    })

    describe('updateAction()', () => {
        it('should return true if successful', async () => {
            const actionPk = 2
            const expectedResponse = { affectedRows: 1, insertId: 0 }

            expectHttpPatchResponses([expectedResponse])

            const actualResult = await actionApi.updateAction(actionPk, { status: ActionStatus.CLOSED })
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(true)
        })

        it('should return false if no rows where affected', async () => {
            const actionPk = 2
            const expectedResponse = { affectedRows: 0, insertId: 0 }

            expectHttpPatchResponses([expectedResponse])

            const actualResult = await actionApi.updateAction(actionPk, { status: ActionStatus.CLOSED })
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(false)
        })

        it('should return an error if the http client fails', async () => {
            const actionPk = 2

            expectHttpPatchResponses([new Error('bad connection')])

            const actualResult = await actionApi.updateAction(actionPk, { status: ActionStatus.CLOSED })
            expect(actualResult).toBeInstanceOf(Error)
        })
    })

    describe('isInsightAlreadyLinked()', () => {
        it('should return true if a match is found', async () => {
            const rulePk = 200
            const villagePk = 2
            const mockMatch: ActionDTO[] = [
                {
                    action_pk: 1,
                    village_fk: villagePk,
                    title: 'Fix all the things',
                    description: 'Everything is broken and needs fixing',
                    user_fk: null,
                    status: ActionStatus.OPEN,
                    opened_at: '2020-05-06T01:37:27.000Z',
                    closed_at: null,
                    resolution: null,
                    updated_at: '2020-05-06T01:37:27.000Z'
                }
            ]

            expectHttpResponses([mockMatch])

            const actualResult = await actionApi.isInsightAlreadyLinked(rulePk, villagePk)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(true)
        })

        it('should return false if no match was found', async () => {
            const rulePk = 200
            const villagePk = 2
            const mockMatch: ActionDTO[] = []

            expectHttpResponses([mockMatch])

            const actualResult = await actionApi.isInsightAlreadyLinked(rulePk, villagePk)
            if (actualResult instanceof Error) throw actualResult

            expect(actualResult).toEqual(false)
        })

        it('should return an error if the http client fails', async () => {
            const rulePk = 200
            const villagePk = 2
            expectHttpResponses([new Error('bad connection')])

            const actualResult = await actionApi.isInsightAlreadyLinked(rulePk, villagePk)
            expect(actualResult).toBeInstanceOf(Error)
        })
    })
})
