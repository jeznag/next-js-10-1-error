import { HttpClient } from '@services'
import { expectHttpResponses } from '@utils'
import { XMysqlApi, MAX_ROWS } from '@api'

describe('Testing XMysqlApi class', () => {
    const entityName = 'mock_entity'
    const fields = [
        'mock_entity_pk',
        'name'
    ]
    type MockEntity = {
        mock_entity_pk: number
        name: string
    }
    let api: XMysqlApi<MockEntity>
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        api = new XMysqlApi<MockEntity>(entityName, fields, httpMock)
    })

    describe('getFromKey()', () => {
        it('should return the entity when a match is found', async () => {
            const mockKey = 6
            const expectedResponse = [{
                mock_entity_pk: mockKey,
                name: 'Bill'
            }]

            expectHttpResponses([expectedResponse])

            const entity = await api.getFromKey(mockKey)
            if (entity instanceof Error) throw entity

            expect(entity?.mock_entity_pk).toStrictEqual(mockKey)
        })

        it('should return undefined if no match was found', async () => {
            const mockKey = 6
            const expectedResponse: Array<any> = []
            expectHttpResponses([expectedResponse])

            const entity = await api.getFromKey(mockKey)
            if (entity instanceof Error) throw entity

            expect(entity).toEqual(undefined)
        })

        it('should return an error if http client fails', async () => {
            const mockKey = 6
            const expectedResponse = new Error('bad connection')
            expectHttpResponses([expectedResponse])

            const entities = await api.getFromKey(mockKey)

            expect(entities).toBeInstanceOf(Error)
        })
    })

    describe('get()', () => {
        it('should return a list of entities', async () => {
            const expectedEntities: MockEntity[] = [
                {
                    mock_entity_pk: 1,
                    name: 'Camsolar'
                },
                {
                    mock_entity_pk: 2,
                    name: 'Pteah Baitong'
                },
                {
                    mock_entity_pk: 3,
                    name: 'Okra'
                }
            ]
            const data = {
                _size: expectedEntities.length
            }

            expectHttpResponses([expectedEntities])

            const actualEntities = await api.get(data)

            expect(actualEntities).toStrictEqual(expectedEntities)
        })

        it('should return an error if trying to fetch rows exceeding the maximum rows', async () => {
            const fatalRowRequest = MAX_ROWS + 10
            const entities = await api.get(undefined, fatalRowRequest)

            expect(entities).toBeInstanceOf(Error)
        })

        it('should return an error if http client fails', async () => {
            const expectedResponse = new Error('bad connection')
            expectHttpResponses([expectedResponse])

            const entities = await api.get()

            expect(entities).toBeInstanceOf(Error)
        })

        it('should return specific sql error when http returns the expected syntax error', async () => {
            const expectedError = {
                error: {
                    code: 'ER_PARSE_ERROR',
                    errno: 1064,
                    sqlMessage: "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'from `entity` limit 0,20' at line 1",
                    sqlState: '42000',
                    index: 0,
                    sql: 'select from `entity` limit 0,20 '
                }
            }

            expectHttpResponses([expectedError])
            const entities = await api.get()

            expect(entities).toBeInstanceOf(Error)
            expect((entities as Error).message).toStrictEqual(expectedError.error.sqlMessage)
        })
    })

    describe('getAll()', () => {
        it('should return all entities when there are more then the max page size', async () => {
            // Create mock data which is x5 the MAX_ROWs that can be returned
            const entityCount = MAX_ROWS * 5

            const entities: MockEntity[] = []
            for (let i = 0; i < entityCount; i++) {
                entities.push({
                    mock_entity_pk: i,
                    name: `${i}`
                })
            }

            // Split up the entities into http response chunks, which don't exceed the MAX_ROWs
            const expectedResponses: Array<MockEntity[]> = []
            for (let i = 0; i < entities.length; i += MAX_ROWS) {
                const chunkedArray = entities.slice(i, i + MAX_ROWS)
                expectedResponses.push(chunkedArray)
            }

            // Setup the mock responses so that page count is first, followed by the data
            const expectedRowCount = [{ no_of_rows: entityCount }]
            expectHttpResponses([expectedRowCount, ...expectedResponses])

            const actualEntities = await api.getAll()

            expect(actualEntities).toStrictEqual(entities)
        })

        it('should return an error early if `get` returns an error', async () => {
            const expectedGetPageCount = [{ no_of_rows: 3 }]
            const expectedGetResponse = new Error('bad connection')
            expectHttpResponses([expectedGetPageCount, expectedGetResponse])

            const entities = await api.getAll()

            expect(entities).toBeInstanceOf(Error)
        })

        it('should return an error if http client does not return number of rows from getPageCount call ', async () => {
            const expectedGetResponse = new Error('Cannot GET /api/xjoin/count')
            expectHttpResponses([expectedGetResponse])

            const entities = await api.getAll()

            expect(entities).toBeInstanceOf(Error)
        })
    })

    describe('getAllWithCustomEntity()', () => {
        it('should return all entities when there are more then the max page size', async () => {
            // Create mock data which is x5 the MAX_ROWs that can be returned
            const entityCount = MAX_ROWS * 5

            const entities: MockEntity[] = []
            for (let i = 0; i < entityCount; i++) {
                entities.push({
                    mock_entity_pk: i,
                    name: `${i}`
                })
            }

            // Split up the entities into http response chunks, which don't exceed the MAX_ROWs
            const expectedResponses: Array<MockEntity[]> = []
            for (let i = 0; i < entities.length; i += MAX_ROWS) {
                const chunkedArray = entities.slice(i, i + MAX_ROWS)
                expectedResponses.push(chunkedArray)
            }

            // Setup the mock responses so that page count is first, followed by the data
            const expectedRowCount = [{ no_of_rows: entityCount }]
            expectHttpResponses([expectedRowCount, ...expectedResponses])

            const actualEntities = await api.getAllWithCustomEntity<MockEntity>(undefined, 'foo')

            expect(actualEntities).toStrictEqual(entities)
        })

        it('should return an error early if `get` returns an error', async () => {
            const expectedGetPageCount = [{ no_of_rows: 3 }]
            const expectedGetResponse = new Error('bad connection')
            expectHttpResponses([expectedGetPageCount, expectedGetResponse])

            const actualEntities = await api.getAllWithCustomEntity<MockEntity>(undefined, 'foo')

            expect(actualEntities).toBeInstanceOf(Error)
        })

        it('should return an error if http client does not return number of rows from getPageCount call ', async () => {
            const expectedGetResponse = new Error('Cannot GET /api/xjoin/count')
            expectHttpResponses([expectedGetResponse])

            const actualEntities = await api.getAllWithCustomEntity<MockEntity>(undefined, 'foo')

            expect(actualEntities).toBeInstanceOf(Error)
        })
    })

    describe('getJoin()', () => {
        it('should call get() again if the first returned results has the length of MAX_ROWS', async () => {
            const mockJoinParams = {
                _join: 'c.consumer,_j,pt.package_type',
                _on1: '(n.product_fk,eq,p.product_pk)',
                _fields: [
                    'c.alias',
                    'pt.description_internal'].join(',')
            }
            const mockResults = Array.from({ length: 99 }).map(() => ({
                alias: 'Naruto',
                description_internal: 'Hokage'
            }))

            jest.spyOn(httpMock, 'get')
                .mockResolvedValueOnce(mockResults)
                .mockResolvedValueOnce([])

            const entity = await api.getJoin(mockJoinParams)
            if (entity instanceof Error) throw entity

            expect(httpMock.get).toBeCalledTimes(2)
            expect(entity).toStrictEqual(mockResults)
        })

        it('should return an error if join parameter contains whitespaces', async () => {
            const mockJoinParams = {
                _join: 'c.consumer, _j ,pt.package_type',
                _on1: '(n.product_fk, eq,p.product_pk)',
                _fields: [
                    'c.alias',
                    'pt.description_internal'].join(',')
            }

            const entity = await api.getJoin(mockJoinParams)

            expect(entity).toBeInstanceOf(Error)
        })

        it('should return an error if there is a _on* and table number mismatched', async () => {
            const mockJoinParams = {
                _join: 'c.consumer,_j,pt.package_type',
                _on1: '(n.product_fk,eq,p.product_pk)',
                _on2: '(n.product_fk,eq,p.product_pk)',
                _fields: [
                    'c.alias',
                    'pt.description_internal'].join(',')
            }

            const entity = await api.getJoin(mockJoinParams)

            expect(entity).toBeInstanceOf(Error)
        })
    })
})
