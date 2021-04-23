import { HttpClient } from '@services'
import { expectHttpResponses } from '@utils'
import { PackageTypeApi, PackageTypeDTO } from '@api'
import { postpaidPackages } from '../../__mocks__/data/packages'

describe('Testing PackageTypeApi class', () => {
    let packageTypeApi: PackageTypeApi
    let httpMock: HttpClient
    let mockPackageTypeKey: number

    beforeEach(() => {
        httpMock = new HttpClient()
        packageTypeApi = new PackageTypeApi(httpMock)
        mockPackageTypeKey = 8
    })

    describe('getAllWithConsumerCountFromDesco', () => {
        it('should fetch the consumer count for each package offered by the desco', async () => {
            const pageCount = [
                { no_of_rows: 3 }
            ]

            const packageTypesResponse: PackageTypeDTO[] = [
                postpaidPackages[0],
                postpaidPackages[1],
                postpaidPackages[2]
            ].map(packageType => ({
                package_type_pk: packageType.packageTypePk,
                payment_type: packageType.paymentType,
                tariff_type: packageType.tariffType,
                base_rate: packageType.baseRate,
                excess_rate: packageType.excessRate,
                code: packageType.currencyCode,
                currency_fk: packageType.currencyFk,
                description_internal: packageType.descriptionInternal,
                base_allowance_wh: packageType.baseAllowanceWh,
                desco_fk: packageType.descoFk,
                consumer_count: 2
            }))

            const expectedResult = [
                { ...postpaidPackages[0], consumerCount: 2 },
                { ...postpaidPackages[1], consumerCount: 2 },
                { ...postpaidPackages[2], consumerCount: 2 }
            ]
            expectHttpResponses<PackageTypeDTO>([pageCount, packageTypesResponse])
            const descoPackages = await packageTypeApi.getAllWithConsumerCountFromDesco(123)

            expect(descoPackages).toStrictEqual(expectedResult)
        })
    })

    describe('getAllForKeys', () => {
        it('should fetch complete packages from the given package type key and consumer key', async () => {
            const expectedPackageType = {
                ...postpaidPackages[0],
                consumerCount: 1
            }
            const expectedFetchedPackage = [{
                package_type_pk: expectedPackageType.packageTypePk,
                payment_type: expectedPackageType.paymentType,
                tariff_type: expectedPackageType.tariffType,
                base_rate: expectedPackageType.baseRate,
                excess_rate: expectedPackageType.excessRate,
                currency_fk: expectedPackageType.currencyFk,
                code: expectedPackageType.currencyCode,
                description_internal: expectedPackageType.descriptionInternal,
                base_allowance_wh: expectedPackageType.baseAllowanceWh,
                desco_fk: expectedPackageType.descoFk,
                consumer_count: 1
            }]

            expectHttpResponses([expectedFetchedPackage])
            const actualCompletePackage = await packageTypeApi.getAllForKeys([mockPackageTypeKey])

            expect(actualCompletePackage).toStrictEqual([expectedPackageType])
        })

        it('should throw an error if fetching nodes fails', async () => {
            const packageError = new Error('bad connection')

            expectHttpResponses([packageError])
            const actualNodes = await packageTypeApi.getAllForKeys([mockPackageTypeKey])

            expect(actualNodes).toBeInstanceOf(Error)
        })

        it('should return undefined if the complete package does not exists', async () => {
            const expectedFetchedPackage: [] = []

            expectHttpResponses([expectedFetchedPackage])

            const actualNodes = await packageTypeApi.getAllForKeys([mockPackageTypeKey])

            expect(actualNodes).toEqual([])
        })
    })
})
