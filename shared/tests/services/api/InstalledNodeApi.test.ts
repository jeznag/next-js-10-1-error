import { HttpClient } from '@services'
import { expectHttpResponses } from '@utils'
import {
    InstalledNodeApi,
    InstalledNode,
    InstalledNodeDTO,
    ProductTypeName
} from '@api'

describe('Testing ConsumerApi class', () => {
    let nodeApi: InstalledNodeApi
    let httpMock: HttpClient
    let mockVillageKey: number

    beforeEach(() => {
        httpMock = new HttpClient()
        nodeApi = new InstalledNodeApi(httpMock)
        mockVillageKey = 1
    })

    it('should fetch nodes from the given consumer key', async () => {
        const mockNodeDtos: InstalledNodeDTO[] = [
            {
                node_pk: 242,
                battery_capacity: 100,
                solar_capacity: 310,
                consumer_fk: 211,
                village_fk: mockVillageKey,
                product_fk: 301,
                latitude: 10.94601620,
                longitude: 104.91414160,
                product_type_pk: 11,
                connected_at: '2019-05-30T11:45:32.000Z',
                product_name: ProductTypeName.Edamame,
                release: 's30'
            },
            {
                node_pk: 278,
                battery_capacity: 100,
                solar_capacity: 310,
                consumer_fk: 211,
                village_fk: mockVillageKey,
                product_fk: 302,
                latitude: 10.94601620,
                longitude: 104.91414160,
                product_type_pk: 12,
                connected_at: '2019-05-30T11:45:32.000Z',
                product_name: ProductTypeName.Pineapple,
                release: 's35 - juice edition'
            }
        ]
        const pageCount = [
            { no_of_rows: 1 }
        ]

        const expectedNodes: InstalledNode[] = mockNodeDtos.map(nodeDto => {
            return nodeApi.parseNodeDto(nodeDto)
        })

        expectHttpResponses([pageCount, mockNodeDtos])
        const actualNodes = await nodeApi.getAllFromVillages([mockVillageKey])

        expect(actualNodes).toStrictEqual(expectedNodes)
    })

    it('should throw an error if fetching nodes fails', async () => {
        const nodeError = new Error('bad connection')

        expectHttpResponses([nodeError])

        const actualNodes = await nodeApi.getAllFromVillages([mockVillageKey])
        expect(actualNodes).toBeInstanceOf(Error)
    })
})
