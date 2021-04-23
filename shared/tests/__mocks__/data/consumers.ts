
import {
    Consumer,
    ConsumerPackageState,
    ProductTypeName,
    PaymentType,
    TariffType,
    TransactionType,
    ApplianceState
} from '@api'
import { DateTime } from 'luxon'
import { applianceTypes } from './appliance-types'

const coffeePot = applianceTypes[0]
export const consumers: Consumer[] = [
    {
        consumerPk: 8,
        isBilled: true,
        uuid: 'j2jBAEr',
        alias: 'PD-003',
        firstName: 'Aum ',
        lastName: 'Rith',
        mobileNumber: '85516307848',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 28,
        villageFk: 1,
        nodes: [
            {
                nodePk: 4,
                batteryCapacity: 65,
                solarCapacity: 150,
                consumerFk: 8,
                productFk: 55,
                villageFk: 1,
                latitude: 10.9458345,
                longitude: 104.9143991,
                connectedAt: DateTime.fromISO('2020-06-04T18:28:46.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 3,
                    name: ProductTypeName.Pineapple,
                    release: 'R5'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 28,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.kWhRate,
            baseRate: 0.01,
            excessRate: 0,
            currencyFk: 2,
            descriptionInternal: 'Special rate for first 5 homes ($0.625/kWh)',
            baseAllowanceWh: 0,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-05-31T16:59:59.000Z',
            amount: 37.97,
            balance: -270.8778,
            consumerFk: 8,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 0,
            excessRate: 0.01,
            baseAllowanceWh: 0,
            paymentType: PaymentType.PostPaid
        },
        outageHrsPastWeek: 5,
        appliances: [{
            appliancePk: 1,
            leaseStartDate: '2020-05-06T01:37:27.000Z',
            applianceState: ApplianceState.Active,
            outstandingBalance: coffeePot.fullPrice,
            applianceTypeFk: coffeePot.applianceTypePk,
            consumerFk: 8,
            applianceName: coffeePot.description,
            appliancePrice: coffeePot.fullPrice
        }]
    },
    {
        consumerPk: 29,
        isBilled: true,
        uuid: 'BqIpczo',
        alias: 'PD-006',
        firstName: 'Ke',
        lastName: 'Nhor',
        mobileNumber: '855972288162',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-08-04T04:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 1,
        villageFk: 1,
        nodes: [
            {
                nodePk: 35,
                batteryCapacity: 65,
                solarCapacity: 150,
                consumerFk: 29,
                villageFk: 1,
                productFk: 32,
                latitude: 0,
                longitude: 0,
                connectedAt: DateTime.fromISO('2020-06-04T18:27:52.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 3,
                    name: ProductTypeName.Pineapple,
                    release: 'R5'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 1,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.FlatRate,
            baseRate: 5,
            excessRate: 0.00125,
            currencyFk: 2,
            descriptionInternal: '$5 Flat, 6kWh',
            baseAllowanceWh: 6000,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-05-31T16:59:59.000Z',
            amount: 5.87,
            balance: -140.754,
            consumerFk: 29,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 5,
            excessRate: 0.00125,
            baseAllowanceWh: 6000,
            paymentType: PaymentType.PostPaid
        },
        outageHrsPastWeek: 10,
        appliances: []
    },
    {
        consumerPk: 39,
        isBilled: true,
        uuid: 'ShGzmJD',
        alias: 'PD-013',
        firstName: 'Mrs. ',
        lastName: 'Lai',
        mobileNumber: '855887967763',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-08-28T04:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 1,
        villageFk: 1,
        nodes: [
            {
                nodePk: 47,
                batteryCapacity: 65,
                solarCapacity: 150,
                consumerFk: 39,
                villageFk: 1,
                productFk: 49,
                latitude: 0,
                longitude: 0,
                connectedAt: DateTime.fromISO('2020-06-04T18:27:34.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 3,
                    name: ProductTypeName.Pineapple,
                    release: 'R5'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 1,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.FlatRate,
            baseRate: 5,
            excessRate: 0.00125,
            currencyFk: 2,
            descriptionInternal: '$5 Flat, 6kWh',
            baseAllowanceWh: 6000,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-05-31T16:59:59.000Z',
            amount: 5,
            balance: -106.8039,
            consumerFk: 39,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 5,
            excessRate: 0.00125,
            baseAllowanceWh: 6000,
            paymentType: PaymentType.PostPaid
        },
        outageHrsPastWeek: 20,
        appliances: []
    },
    {
        consumerPk: 64,
        isBilled: true,
        uuid: 'pGLmhCM',
        alias: 'PD-023',
        firstName: 'Ke ',
        lastName: 'Him',
        mobileNumber: '85566771238',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-10-02T08:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 1,
        villageFk: 1,
        nodes: [
            {
                nodePk: 84,
                batteryCapacity: 65,
                solarCapacity: 150,
                consumerFk: 64,
                villageFk: 1,
                productFk: 80,
                latitude: 0,
                longitude: 0,
                connectedAt: DateTime.fromISO('2020-05-25T11:45:22.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 3,
                    name: ProductTypeName.Pineapple,
                    release: 'R5'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 1,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.FlatRate,
            baseRate: 5,
            excessRate: 0.00125,
            currencyFk: 2,
            descriptionInternal: '$5 Flat, 6kWh',
            baseAllowanceWh: 6000,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-04-30T16:59:59.000Z',
            amount: 10.54,
            balance: -138.6627,
            consumerFk: 64,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 5,
            excessRate: 0.00125,
            baseAllowanceWh: 6000,
            paymentType: PaymentType.PostPaid
        },
        appliances: []
    },
    {
        consumerPk: 67,
        isBilled: true,
        uuid: '15AawSs',
        alias: 'PN-026',
        firstName: '?',
        lastName: '?',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-10-05T12:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 1,
        villageFk: 1,
        nodes: [
            {
                nodePk: 87,
                batteryCapacity: 65,
                solarCapacity: 150,
                consumerFk: 67,
                villageFk: 1,
                productFk: 276,
                latitude: 0,
                longitude: 0,
                connectedAt: DateTime.fromISO('2020-06-04T18:27:27.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 4,
                    name: ProductTypeName.Pineapple,
                    release: 'R5- HV'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 1,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.FlatRate,
            baseRate: 5,
            excessRate: 0.00125,
            currencyFk: 2,
            descriptionInternal: '$5 Flat, 6kWh',
            baseAllowanceWh: 6000,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-05-31T16:59:59.000Z',
            amount: 7.71,
            balance: -141.1288,
            consumerFk: 67,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 5,
            excessRate: 0.00125,
            baseAllowanceWh: 6000,
            paymentType: PaymentType.PostPaid
        },
        appliances: []
    },
    {
        consumerPk: 70,
        isBilled: true,
        uuid: 'vboZYYb',
        alias: 'PS-029',
        firstName: '?',
        lastName: '?',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-10-16T05:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 1,
        villageFk: 1,
        nodes: [
            {
                nodePk: 90,
                batteryCapacity: 65,
                solarCapacity: 150,
                consumerFk: 70,
                villageFk: 1,
                productFk: 96,
                latitude: 0,
                longitude: 0,
                connectedAt: DateTime.fromISO('2020-06-04T18:31:39.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 3,
                    name: ProductTypeName.Pineapple,
                    release: 'R5'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 1,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.FlatRate,
            baseRate: 5,
            excessRate: 0.00125,
            currencyFk: 2,
            descriptionInternal: '$5 Flat, 6kWh',
            baseAllowanceWh: 6000,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-05-31T16:59:59.000Z',
            amount: 5,
            balance: -126.2744,
            consumerFk: 70,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 5,
            excessRate: 0.00125,
            baseAllowanceWh: 6000,
            paymentType: PaymentType.PostPaid
        },
        appliances: []
    },
    {
        consumerPk: 79,
        isBilled: true,
        uuid: '8EzUP4q',
        alias: 'PS-033',
        firstName: '?',
        lastName: '?',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-11-09T05:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 1,
        villageFk: 1,
        nodes: [
            {
                nodePk: 100,
                batteryCapacity: 65,
                solarCapacity: 70,
                consumerFk: 79,
                villageFk: 1,
                productFk: 109,
                latitude: 0,
                longitude: 0,
                connectedAt: DateTime.fromISO('2020-04-16T18:32:12.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 3,
                    name: ProductTypeName.Pineapple,
                    release: 'R5'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 1,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.FlatRate,
            baseRate: 5,
            excessRate: 0.00125,
            currencyFk: 2,
            descriptionInternal: '$5 Flat, 6kWh',
            baseAllowanceWh: 6000,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-03-31T16:59:59.000Z',
            amount: 5,
            balance: -73.5,
            consumerFk: 79,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 5,
            excessRate: 0.00125,
            baseAllowanceWh: 6000,
            paymentType: PaymentType.PostPaid
        },
        appliances: []
    },
    {
        consumerPk: 89,
        isBilled: true,
        uuid: 'Cd5xjkU',
        alias: 'PN-038',
        firstName: '?',
        lastName: '?',
        packageState: ConsumerPackageState.ACTIVE,
        packageStartDate: DateTime.fromISO('2018-11-04T10:30:00.000Z', { zone: 'utc' }),
        createdAt: DateTime.fromISO('2018-05-14T12:30:00.000Z', { zone: 'utc' }),
        packageTypeFk: 1,
        villageFk: 1,
        nodes: [
            {
                nodePk: 111,
                batteryCapacity: 65,
                solarCapacity: 100,
                consumerFk: 89,
                villageFk: 1,
                productFk: 85,
                latitude: 0,
                longitude: 0,
                connectedAt: DateTime.fromISO('2020-06-04T18:37:11.000Z', { zone: 'utc' }),
                productType: {
                    productTypePk: 3,
                    name: ProductTypeName.Pineapple,
                    release: 'R5'
                }
            }
        ],
        package: {
            descoFk: 2,
            packageTypePk: 1,
            paymentType: PaymentType.PostPaid,
            tariffType: TariffType.FlatRate,
            baseRate: 5,
            excessRate: 0.00125,
            currencyFk: 2,
            descriptionInternal: '$5 Flat, 6kWh',
            baseAllowanceWh: 6000,
            currencyCode: 'USD'
        },
        latestTransaction: {
            type: TransactionType.Charge,
            latestTransactionDate: '2020-05-31T16:59:59.000Z',
            amount: 5,
            balance: -90.5996,
            consumerFk: 89,
            villageFk: 1,
            currencyCode: 'USD',
            baseRate: 5,
            excessRate: 0.00125,
            baseAllowanceWh: 6000,
            paymentType: PaymentType.PostPaid
        },
        appliances: []
    }
]
