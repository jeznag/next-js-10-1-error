import { PackageType, PaymentType, TariffType } from '@api'

export const prepaidPackages: PackageType[] = [{
    packageTypePk: 33,
    paymentType: PaymentType.PrePaid,
    tariffType: TariffType.FlatRate,
    baseRate: 45,
    excessRate: 0.01,
    currencyFk: 83,
    descriptionInternal: 'Productive Family',
    baseAllowanceWh: 1600,
    descoFk: 7,
    currencyCode: 'PHP'
},
{
    packageTypePk: 34,
    paymentType: PaymentType.PrePaid,
    tariffType: TariffType.FlatRate,
    baseRate: 15,
    excessRate: 0.01,
    currencyFk: 83,
    descriptionInternal: 'Basic',
    baseAllowanceWh: 380,
    descoFk: 7,
    currencyCode: 'PHP'
},
{
    packageTypePk: 35,
    paymentType: PaymentType.PrePaid,
    tariffType: TariffType.kWhRate,
    baseRate: 8,
    excessRate: 0.01,
    currencyFk: 83,
    descriptionInternal: 'Entry',
    baseAllowanceWh: 200,
    descoFk: 7,
    currencyCode: 'PHP'
},
{
    packageTypePk: 36,
    paymentType: PaymentType.PrePaid,
    tariffType: TariffType.kWhRate,
    baseRate: 30,
    excessRate: 0.01,
    currencyFk: 83,
    descriptionInternal: 'High',
    baseAllowanceWh: 800,
    descoFk: 7,
    currencyCode: 'PHP'
}]

export const postpaidPackages: PackageType[] = [
    {
        packageTypePk: 1,
        paymentType: PaymentType.PostPaid,
        tariffType: TariffType.FlatRate,
        baseRate: 5,
        excessRate: 0.00125,
        currencyFk: 2,
        descriptionInternal: '$5 Flat, 6kWh',
        baseAllowanceWh: 6000,
        descoFk: 2,
        currencyCode: 'USD'
    },
    {
        packageTypePk: 2,
        paymentType: PaymentType.PostPaid,
        tariffType: TariffType.FlatRate,
        baseRate: 8,
        excessRate: 0.00125,
        currencyFk: 2,
        descriptionInternal: '$8 Flat, 9.6kWh',
        baseAllowanceWh: 9600,
        descoFk: 2,
        currencyCode: 'USD'
    },
    {
        packageTypePk: 3,
        paymentType: PaymentType.PostPaid,
        tariffType: TariffType.FlatRate,
        baseRate: 12,
        excessRate: 0.00125,
        currencyFk: 2,
        descriptionInternal: '$12 Flat, 15kWh',
        baseAllowanceWh: 15000,
        descoFk: 2,
        currencyCode: 'USD'
    },
    {
        packageTypePk: 28,
        paymentType: PaymentType.PostPaid,
        tariffType: TariffType.kWhRate,
        baseRate: 0.01,
        excessRate: 0,
        currencyFk: 2,
        descriptionInternal: 'Special rate for first 5 homes ($0.625/kWh)',
        baseAllowanceWh: 0,
        descoFk: 2,
        currencyCode: 'USD'
    }
]
