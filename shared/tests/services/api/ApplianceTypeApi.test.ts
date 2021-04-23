import {
    XMysqlApi,
    ApplianceTypeApi,
    ApplianceType,
    ApplianceTypeDTO
} from '@api'
import { HttpClient } from '@services'

describe('Testing ApplianceTypeApi class', () => {
    let applianceTypeApi: ApplianceTypeApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        applianceTypeApi = new ApplianceTypeApi(httpMock)
    })

    it('should fetch all appliance types using the desco key', async () => {
        const mockAppliancesDto: ApplianceTypeDTO[] = [
            {
                appliance_type_pk: 10,
                description: 'Fridge',
                desco_fk: 6,
                repayment_rate: 4,
                full_price: 120
            },
            {
                appliance_type_pk: 15,
                description: 'Coffee Pot',
                desco_fk: 6,
                repayment_rate: 90,
                full_price: 1230
            }
        ]

        const expectedAppliances: ApplianceType[] = [
            {
                applianceTypePk: 10,
                repaymentRate: 4,
                fullPrice: 120,
                description: 'Fridge',
                descoFk: 6,
                consumerCount: undefined
            },
            {
                applianceTypePk: 15,
                repaymentRate: 90,
                fullPrice: 1230,
                description: 'Coffee Pot',
                descoFk: 6,
                consumerCount: undefined
            }
        ]

        jest.spyOn(XMysqlApi.prototype, 'getAllWithCustomEntity').mockResolvedValueOnce(mockAppliancesDto)

        const actualAppliances = await applianceTypeApi.getAllFromDesco(123)

        expect(actualAppliances).toStrictEqual(expectedAppliances)
    })

    it('should log error if fetching appliances fails', async () => {
        const expectedError = new Error('bad connection')

        jest.spyOn(XMysqlApi.prototype, 'getAllWithCustomEntity').mockResolvedValueOnce(expectedError)

        const actualAppliances = await applianceTypeApi.getAllFromDesco(123)

        expect(actualAppliances).toBeInstanceOf(Error)
    })
})
