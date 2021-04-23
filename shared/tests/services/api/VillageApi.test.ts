import { HttpClient } from '@services'
import {
    XMysqlApi,
    VillageApi,
    Village,
    VillageDTO
} from '@api'

describe('Testing VillageApi class', () => {
    let villageApi: VillageApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        villageApi = new VillageApi(httpMock)
    })

    it('should fetch all village using the desco key', async () => {
        const mockVillagesDto: VillageDTO[] = [
            {
                village_pk: 10,
                name: 'San Isidro',
                alias_prefix: 'SI',
                desco_fk: 6,
                url_slug: 'san-isidro',
                latitude: 0,
                longitude: 0
            },
            {
                village_pk: 15,
                name: 'Calamba',
                alias_prefix: 'CA',
                desco_fk: 6,
                url_slug: 'calamba',
                latitude: 0,
                longitude: 0
            }
        ]

        const expectedVillages: Village[] = [
            {
                villagePk: 10,
                name: 'San Isidro',
                aliasPrefix: 'SI',
                descoFk: 6,
                urlSlug: 'san-isidro',
                latitude: 0,
                longitude: 0
            },
            {
                villagePk: 15,
                name: 'Calamba',
                aliasPrefix: 'CA',
                descoFk: 6,
                urlSlug: 'calamba',
                latitude: 0,
                longitude: 0
            }
        ]

        jest.spyOn(XMysqlApi.prototype, 'getAll').mockResolvedValueOnce(mockVillagesDto)

        const actualVillages = await villageApi.getAllFromDesco(123)

        expect(actualVillages).toStrictEqual(expectedVillages)
    })

    it('should log error if fetching villages fails', async () => {
        const expectedError = new Error('bad connection')

        jest.spyOn(XMysqlApi.prototype, 'getAll').mockResolvedValueOnce(expectedError)

        const actualVillages = await villageApi.getAllFromDesco(123)

        expect(actualVillages).toBeInstanceOf(Error)
    })
})
