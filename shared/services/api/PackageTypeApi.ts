import { Currency } from 'dinero.js'

import { Condition } from '@shared-types'

import { XMysqlApi } from '@api'
import { HttpClient } from '@services'

export enum PaymentType {
    PostPaid = 'POST_PAID',
    PrePaid = 'PRE_PAID'
}

export enum TariffType {
    FlatRate = 'FLAT_RATE',
    kWhRate = 'KWH_RATE'
}

export type PackageTypeDTO = {
    package_type_pk: number
    payment_type: PaymentType
    tariff_type: TariffType
    base_rate: number
    excess_rate: number
    currency_fk: number
    description_internal: string
    base_allowance_wh: number
    desco_fk: number
    currency_code?: string
    consumer_count?: number
}

// NB the DB column name is `code` but we want to provide it as
// `currency_code`
type PackageTypeWithCurrencyCode = PackageTypeDTO & {
    code: string
}

export type PackageType = {
    packageTypePk: number
    paymentType: PaymentType
    tariffType: TariffType
    baseRate: number
    excessRate: number
    currencyFk: number
    descriptionInternal: string
    baseAllowanceWh: number
    descoFk: number
    currencyCode: Currency
    consumerCount?: number
}

export class PackageTypeApi {
    private readonly baseApi: XMysqlApi<PackageTypeDTO>
    private readonly fields = [
        'desco_fk',
        'package_type_pk',
        'payment_type',
        'tariff_type',
        'base_rate',
        'excess_rate',
        'currency_fk',
        'description_internal',
        'base_allowance_wh'
    ]

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new XMysqlApi<PackageTypeDTO>('package_type', this.fields, client)
    }

    public async getAllWithConsumerCountFromDesco (descoKey: number): Promise<PackageType[] | Error> {
        const data = {
            _where: `(desco_fk,eq,${descoKey})`,
            _fields: [...this.fields, 'currency_code', 'consumer_count'].join(',')
        }

        const packages = await this.baseApi.getAllWithCustomEntity<PackageTypeWithCurrencyCode>(
            data,
            'package_type_with_consumer_count'
        )

        if (packages instanceof Error) {
            return packages
        }

        return packages.map(currPackage => this.parseDto(currPackage))
    }

    public async getAllFromDesco (descoKey: number): Promise<PackageType[] | Error> {
        return this.getAllCompletePackages({ desco_fk: `${descoKey}` })
    }

    public async getAllForKeys (packageTypeKeys: number[]): Promise<PackageType[] | Error> {
        if (packageTypeKeys.length <= 0) return []

        const uniqueKeys = [...new Set(packageTypeKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        return this.getAllCompletePackages({ package_type_pk: `${stringOfKeys}` })
    }

    private async getAllCompletePackages (condition?: Condition): Promise<PackageType[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition)
            : undefined

        // The complete package includes the currency code
        // and the current balance (fetched from the latest transaction)
        const dataForJoin = {
            _join: 'p.package_type,_j,c.currency',
            _on1: '(p.currency_fk,eq,c.currency_pk)',
            _fields: [
                ...this.fields.map(field => `p.${field}`),
                'c.code'
            ].join(','),
            ...parsedCondition
        }

        const packageTypes = await this.baseApi.getJoin<PackageTypeWithCurrencyCode>(dataForJoin)

        if (packageTypes instanceof Error) {
            return packageTypes
        }

        return packageTypes.map((packageTypeDto: PackageTypeWithCurrencyCode): PackageType => this.parseDto(packageTypeDto))
    }

    private parseDto (dto: PackageTypeWithCurrencyCode): PackageType {
        return {
            packageTypePk: dto.package_type_pk,
            paymentType: dto.payment_type,
            tariffType: dto.tariff_type,
            baseRate: dto.base_rate,
            excessRate: dto.excess_rate,
            currencyFk: dto.currency_fk,
            descriptionInternal: dto.description_internal,
            baseAllowanceWh: dto.base_allowance_wh,
            descoFk: dto.desco_fk,
            currencyCode: (dto.currency_code || dto.code) as Currency,
            consumerCount: dto.consumer_count
        }
    }
}
