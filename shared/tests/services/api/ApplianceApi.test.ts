import {
    XMysqlApi,
    ApplianceApi,
    Appliance,
    ApplianceWithTypeDTO,
    ApplianceState
} from '@api'
import { HttpClient } from '@services'

describe('Testing ApplianceApi class', () => {
    let applianceApi: ApplianceApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        applianceApi = new ApplianceApi(httpMock)
    })

    it('should fetch all appliances using village keys', async () => {
        const uuid = '1234567'
        const mockAppliancesDto: ApplianceWithTypeDTO[] = [
            {
                uuid,
                appliance_pk: 1,
                lease_start_date: '2019-05-30T11:45:32.000Z',
                appliance_state: ApplianceState.Active,
                outstanding_balance: 100,
                appliance_type_fk: 2,
                consumer_fk: 10,
                description: 'Esperesso Machine',
                full_price: 100,
                village_fk: 1
            }
        ]

        const expectedAppliances: Appliance[] = [
            {
                uuid,
                appliancePk: 1,
                leaseStartDate: '2019-05-30T11:45:32.000Z',
                applianceState: ApplianceState.Active,
                outstandingBalance: 100,
                applianceTypeFk: 2,
                consumerFk: 10,
                applianceName: 'Esperesso Machine',
                appliancePrice: 100
            }
        ]

        jest.spyOn(XMysqlApi.prototype, 'getJoin').mockResolvedValueOnce(mockAppliancesDto)

        const actualAppliances = await applianceApi.getAllFromVillages([123])

        expect(actualAppliances).toStrictEqual(expectedAppliances)
    })

    it('should log error if fetching appliances fails', async () => {
        const expectedError = new Error('bad connection')

        jest.spyOn(XMysqlApi.prototype, 'getJoin').mockResolvedValueOnce(expectedError)

        const actualAppliances = await applianceApi.getAllFromVillages([123])

        expect(actualAppliances).toBeInstanceOf(Error)
    })
})
