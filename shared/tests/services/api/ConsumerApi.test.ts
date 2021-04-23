import { DateTime } from 'luxon'
import { HttpClient } from '@services'
import { expectHttpPatchResponses } from '@utils'
import {
    ConsumerApi,
    ConsumerDTO,
    ConsumerPackageState,
    UpdatableConsumerProperties,
    InstalledNodeApi,
    InstalledNode,
    PackageTypeApi,
    PackageType,
    PaymentType,
    TariffType,
    XMysqlApi,
    TransactionApi,
    Transaction,
    ProductTypeName,
    Aggregation,
    AggregationsApi,
    ApplianceApi,
    Appliance,
    ApplianceState,
    TransactionType,
    Consumer
} from '@api'

describe('Testing ConsumerApi class', () => {
    let httpMock: HttpClient
    let consumerApi: ConsumerApi
    let mockVillageKey: number

    beforeEach(() => {
        httpMock = new HttpClient()
        consumerApi = new ConsumerApi(httpMock)
        mockVillageKey = 1
    })

    describe('getAllFromVillages()', () => {
        it('should get all consumers filled with details from other API tables', async () => {
            const mockRawConsumers: ConsumerDTO[] = [
                {
                    consumer_pk: 6,
                    uuid: 'PYViQ3D',
                    alias: 'PD-01A',
                    first_name: '?',
                    last_name: '?',
                    mobile_number: null,
                    package_state: ConsumerPackageState.ACTIVE,
                    package_start_date: '2018-05-14T12:30:00.000Z',
                    package_end_date: '2018-05-14T12:30:00.000Z',
                    created_at: '2018-05-14T12:30:00.000Z',
                    package_type_fk: 4,
                    village_fk: 1
                },
                {
                    consumer_pk: 7,
                    uuid: 'Hvp3k4M',
                    alias: 'PD-02',
                    first_name: '?',
                    last_name: '?',
                    mobile_number: null,
                    package_state: ConsumerPackageState.ACTIVE,
                    package_start_date: '2018-05-14T12:30:00.000Z',
                    package_end_date: '2018-05-14T12:30:00.000Z',
                    created_at: '2018-05-14T12:30:00.000Z',
                    package_type_fk: 4,
                    village_fk: 1
                },
                {
                    consumer_pk: 8,
                    uuid: 'B9a3pRa',
                    alias: 'PD-03',
                    first_name: '?',
                    last_name: '?',
                    mobile_number: null,
                    package_state: ConsumerPackageState.ACTIVE,
                    package_start_date: '2018-05-14T12:30:00.000Z',
                    package_end_date: '2018-05-14T12:30:00.000Z',
                    created_at: '2018-05-14T12:30:00.000Z',
                    package_type_fk: 4,
                    village_fk: 1
                }
            ]

            const mockInstalledNode: InstalledNode = {
                nodePk: Math.floor(Math.random() * 25),
                batteryCapacity: 100,
                solarCapacity: 150,
                productFk: 1,
                productType: {
                    productTypePk: 8,
                    name: ProductTypeName.Edamame,
                    release: 'B'
                },
                consumerFk: 0, // This is mapped to each mock consumer below
                villageFk: 1,
                longitude: 1,
                latitude: 1,
                connectedAt: undefined
            }

            const mockPackageType: PackageType = {
                packageTypePk: 4,
                paymentType: PaymentType.PostPaid,
                tariffType: TariffType.FlatRate,
                currencyFk: 83,
                currencyCode: 'PHP',
                baseRate: 1,
                excessRate: 1,
                descriptionInternal: '',
                descoFk: 1,
                baseAllowanceWh: 1000
            }

            const mockTransactions: Transaction[] = [
                {
                    latestTransactionDate: '2018-06-30T16:59:59.000Z',
                    amount: 4.6572,
                    balance: -4.6572,
                    consumerFk: 6,
                    villageFk: 1,
                    baseRate: 6.00000,
                    excessRate: 0.00125,
                    baseAllowanceWh: 6000,
                    type: TransactionType.Charge,
                    currencyCode: 'USD',
                    paymentType: PaymentType.PostPaid
                },
                {
                    latestTransactionDate: '2018-06-30T16:59:59.000Z',
                    amount: 4.2096,
                    balance: -4.2096,
                    consumerFk: 7,
                    villageFk: 1,
                    baseRate: 6.00000,
                    excessRate: 0.00125,
                    baseAllowanceWh: 6000,
                    type: TransactionType.Charge,
                    currencyCode: 'USD',
                    paymentType: PaymentType.PostPaid
                },
                {
                    latestTransactionDate: '2018-06-30T16:59:59.000Z',
                    amount: 3.2076,
                    balance: -3.2076,
                    consumerFk: 8,
                    villageFk: 1,
                    baseRate: 6.00000,
                    excessRate: 0.00125,
                    baseAllowanceWh: 6000,
                    type: TransactionType.Charge,
                    currencyCode: 'USD',
                    paymentType: PaymentType.PostPaid
                }
            ]

            const mockAggregations: Aggregation[] = [
                {
                    aggPk: 1,
                    date: '2020-10-01',
                    consumerPk: 6,
                    villagePk: 1,
                    percentSystemUptime: 0.5
                },
                {
                    aggPk: 2,
                    date: '2020-10-01',
                    consumerPk: 7,
                    villagePk: 1,
                    percentSystemUptime: 0.5
                },
                {
                    aggPk: 3,
                    date: '2020-10-01',
                    consumerPk: 8,
                    villagePk: 1,
                    percentSystemUptime: 0.5
                }
            ]

            const mockAppliances: Appliance[] = [
                {
                    appliancePk: 1,
                    leaseStartDate: '2018-06-30T16:59:59.000Z',
                    applianceState: ApplianceState.Active,
                    outstandingBalance: 0,
                    applianceTypeFk: 1,
                    consumerFk: 8,
                    applianceName: 'Freezer',
                    appliancePrice: 1000
                }
            ]

            const mockNodes: InstalledNode[] = mockRawConsumers.map(consumer => {
                return {
                    ...mockInstalledNode,
                    consumerFk: consumer.consumer_pk
                }
            })

            const expectedCompleteConsumers: Consumer[] = mockRawConsumers.map(consumer => {
                let outageHrs
                const foundAgg = mockAggregations.find(agg => agg.consumerPk === consumer.consumer_pk)
                if (foundAgg && foundAgg.percentSystemUptime) {
                    outageHrs = (1 - foundAgg.percentSystemUptime) * 24
                }
                return {
                    consumerPk: consumer.consumer_pk,
                    uuid: consumer.uuid,
                    alias: consumer.alias,
                    firstName: consumer.first_name,
                    lastName: consumer.last_name,
                    packageState: ConsumerPackageState.ACTIVE,
                    packageStartDate: consumer.package_start_date
                        ? DateTime.fromISO(consumer.package_start_date, { zone: 'utc' })
                        : undefined,
                    packageEndDate: consumer.package_end_date
                        ? DateTime.fromISO(consumer.package_end_date, { zone: 'utc' })
                        : undefined,
                    packageTypeFk: consumer.package_type_fk ?? undefined,
                    villageFk: consumer.village_fk,
                    mobileNumber: consumer.mobile_number ?? undefined,
                    isBilled: !!mockTransactions.find(transaction => transaction.consumerFk === consumer.consumer_pk),
                    nodes: [{ ...mockInstalledNode, consumerFk: consumer.consumer_pk }],
                    package: { ...mockPackageType },
                    latestTransaction: mockTransactions.find(transaction => transaction.consumerFk === consumer.consumer_pk),
                    outageHrsPastWeek: outageHrs,
                    appliances: mockAppliances.filter(appliance => appliance.consumerFk === consumer.consumer_pk),
                    createdAt: DateTime.fromISO(consumer.created_at, { zone: 'utc' })
                }
            })

            // Mock a bunch of the API calls in the order they are called
            jest.spyOn(XMysqlApi.prototype, 'getAll').mockResolvedValueOnce(mockRawConsumers)
            jest.spyOn(InstalledNodeApi.prototype, 'getAllFromVillages').mockResolvedValueOnce(mockNodes)
            jest.spyOn(TransactionApi.prototype, 'getLatestFromVillages').mockResolvedValueOnce(mockTransactions)
            jest.spyOn(TransactionApi.prototype, 'getLatestChargeTransactionsFromVillages').mockResolvedValueOnce(mockTransactions)
            jest.spyOn(PackageTypeApi.prototype, 'getAllForKeys').mockResolvedValueOnce([mockPackageType])
            jest.spyOn(AggregationsApi.prototype, 'getAllFromVillages').mockResolvedValueOnce(mockAggregations)
            jest.spyOn(ApplianceApi.prototype, 'getAllFromVillages').mockResolvedValueOnce(mockAppliances)

            const actualCompleteConsumers = await consumerApi.getAllFromVillages([{
                villagePk: mockVillageKey,
                name: 'The village people',
                aliasPrefix: 'VP',
                descoFk: 123,
                urlSlug: 'village-people',
                latitude: 0,
                longitude: 0
            }])
            if (actualCompleteConsumers instanceof Error) throw actualCompleteConsumers

            for (let i = 0; i < actualCompleteConsumers.length; i++) {
                expect(actualCompleteConsumers[i].consumerPk).toEqual(expectedCompleteConsumers[i].consumerPk)
                expect(actualCompleteConsumers[i].uuid).toEqual(expectedCompleteConsumers[i].uuid)
                expect(actualCompleteConsumers[i].alias).toEqual(expectedCompleteConsumers[i].alias)
                expect(actualCompleteConsumers[i].firstName).toEqual(expectedCompleteConsumers[i].firstName)
                expect(actualCompleteConsumers[i].lastName).toEqual(expectedCompleteConsumers[i].lastName)
                expect(actualCompleteConsumers[i].mobileNumber).toBeUndefined()
                expect(actualCompleteConsumers[i].packageState).toEqual(expectedCompleteConsumers[i].packageState)
                expect(actualCompleteConsumers[i].packageStartDate).toEqual(expectedCompleteConsumers[i].packageStartDate)
                expect(actualCompleteConsumers[i].packageTypeFk).toEqual(expectedCompleteConsumers[i].packageTypeFk)
                expect(actualCompleteConsumers[i].villageFk).toEqual(expectedCompleteConsumers[i].villageFk)
                expect(actualCompleteConsumers[i].nodes).toStrictEqual(expectedCompleteConsumers[i].nodes)
                expect(actualCompleteConsumers[i].package).toStrictEqual(expectedCompleteConsumers[i].package)
                expect(actualCompleteConsumers[i].latestTransaction).toStrictEqual(expectedCompleteConsumers[i].latestTransaction)
                expect(actualCompleteConsumers[i].outageHrsPastWeek).toStrictEqual(expectedCompleteConsumers[i].outageHrsPastWeek)
                expect(actualCompleteConsumers[i].appliances).toStrictEqual(expectedCompleteConsumers[i].appliances)
            }
        })

        it('should throw an error if fetching raw products fails', async () => {
            jest.spyOn(XMysqlApi.prototype, 'getAll').mockResolvedValueOnce(new Error('bad connection'))

            const consumers = await consumerApi.getAllFromVillages([{
                villagePk: mockVillageKey,
                aliasPrefix: 'VP',
                name: 'The village people',
                descoFk: 123,
                urlSlug: 'village-people',
                latitude: 0,
                longitude: 0
            }])

            expect(consumers).toBeInstanceOf(Error)
        })

        it('should throw an error if fetching details from other tables fails', async () => {
            const expectedRawProducts = [
                {
                    product_pk: 1,
                    uuid: '2490427859066643825308217',
                    product_type_fk: 2,
                    firmware_fk: 59,
                    firmware_download_status_fk: 12,
                    desco_fk: 1,
                    connected_at: '2019-05-30T11:45:32.000Z'
                }
            ]

            jest.spyOn(XMysqlApi.prototype, 'getAll').mockResolvedValue(expectedRawProducts)
            jest.spyOn(InstalledNodeApi.prototype, 'getAllFromVillages').mockResolvedValue(new Error('bad connection'))
            jest.spyOn(TransactionApi.prototype, 'getLatestFromVillages').mockResolvedValue(new Error('bad connection'))
            jest.spyOn(TransactionApi.prototype, 'getLatestChargeTransactionsFromVillages').mockResolvedValue(new Error('bad connection'))
            jest.spyOn(PackageTypeApi.prototype, 'getAllForKeys').mockResolvedValue(new Error('bad connection'))
            jest.spyOn(AggregationsApi.prototype, 'getAllFromVillages').mockResolvedValueOnce(new Error('bad connection'))
            jest.spyOn(ApplianceApi.prototype, 'getAllFromVillages').mockResolvedValueOnce(new Error('bad connection'))

            const products = await consumerApi.getAllFromVillages([{
                villagePk: mockVillageKey,
                aliasPrefix: 'VP',
                name: 'The village people',
                descoFk: 123,
                urlSlug: 'village-people',
                latitude: 0,
                longitude: 0
            }])

            expect(products).toBeInstanceOf(Error)
        })
    })

    describe('updateConsumer', () => {
        it('should skip update if all contactDetails property is undefined', async () => {
            const contactDetailsParam: UpdatableConsumerProperties = {
                consumerPk: 1,
                firstName: undefined,
                lastName: undefined,
                mobileNumber: undefined
            }

            const apiSpy = jest.spyOn(XMysqlApi.prototype, 'updateFromKey')

            const result = await consumerApi.updateConsumer(contactDetailsParam)

            expect(result).toBe(true)
            expect(apiSpy).not.toBeCalled()
        })

        it('should return true if successfully updated in database', async () => {
            const contactDetailsParam: UpdatableConsumerProperties = {
                consumerPk: 1,
                firstName: 'Han',
                lastName: 'Solo',
                mobileNumber: '+639123456779'
            }
            const mockResponse = {
                affectedRows: 1,
                insertId: 999
            }

            expectHttpPatchResponses([mockResponse])

            const result = await consumerApi.updateConsumer(contactDetailsParam)

            expect(result).toBe(true)
        })

        it('should not include for update any undefined properties of contactDetail object', async () => {
            const contactDetailsParam: UpdatableConsumerProperties = {
                consumerPk: 1,
                firstName: undefined,
                lastName: 'Solo',
                mobileNumber: undefined
            }
            const mockResponse = {
                affectedRows: 1,
                insertId: 999
            }
            const mockUpdatedAt = DateTime.utc().toSQL()
            const expectedBaseUrl = 'http://localhost:3333/consumer/1'
            const expectedPropertiesForUpdate = {
                last_name: 'Solo',
                updated_at: mockUpdatedAt
            }

            jest.spyOn(DateTime.prototype, 'toSQL').mockReturnValueOnce(mockUpdatedAt)
            const clientSpy = jest.spyOn(HttpClient.prototype, 'patch').mockResolvedValueOnce(mockResponse)
            jest.spyOn(XMysqlApi.prototype, 'baseUrl').mockReturnValueOnce('http://localhost:3333/consumer')

            const result = await consumerApi.updateConsumer(contactDetailsParam)

            expect(result).toBe(true)
            expect(clientSpy).toBeCalledWith(expectedBaseUrl, expectedPropertiesForUpdate, undefined)
        })
    })
})
