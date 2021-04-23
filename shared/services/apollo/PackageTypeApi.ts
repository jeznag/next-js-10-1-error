import { HttpClient } from '@services'
import { ApolloApi } from './ApolloApi'

export enum PaymentType {
    PostPaid = 'POST_PAID',
    PrePaid = 'PRE_PAID'
}

export enum TariffType {
    FlatRate = 'FLAT_RATE',
    kWhRate = 'KWH_RATE'
}

export type PackageTypeDTO = {
    package_type_id: number
    desco_id: number
    currency_code: string
    payment_type: PaymentType
    tariff_type: TariffType
    base_rate: number
    excess_rate: number
    base_allowance_wh: number
    description_internal: string | null
}

export type PackageType = {
    packageTypeId: number
    descoId: number
    currencyCode: string
    paymentType: PaymentType
    tariffType: TariffType
    baseRate: number
    excessRate: number
    baseAllowanceWh: number
    descriptionInternal?: string
}

export class PackageTypeApi {
    private readonly baseApi: ApolloApi<PackageTypeDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('package_types', client)
    }

    public async getAllFromDesco (descoId: number): Promise<PackageType[] | Error> {
        const results = await this.baseApi.getAll({ desco_id: descoId })

        if (results instanceof Error) {
            return results
        }

        return results.map(result => PackageTypeApi.parseDto(result))
    }

    public static parseDto (dto: PackageTypeDTO): PackageType {
        return {
            packageTypeId: dto.package_type_id,
            descoId: dto.desco_id,
            currencyCode: dto.currency_code,
            paymentType: dto.payment_type,
            tariffType: dto.tariff_type,
            baseRate: dto.base_rate,
            excessRate: dto.excess_rate,
            baseAllowanceWh: dto.base_allowance_wh,
            descriptionInternal: dto.description_internal ?? undefined
        }
    }
}
