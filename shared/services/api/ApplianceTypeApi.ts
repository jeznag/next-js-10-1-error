import { Condition } from '@shared-types'

import { XMysqlApi } from './'
import { HttpClient } from '@services'

export type ApplianceTypeDTO = {
    appliance_type_pk: number
    repayment_rate: number
    full_price: number
    description: string
    desco_fk: number
    consumer_count?: number
}

export type ApplianceType = {
    applianceTypePk: number
    repaymentRate: number
    fullPrice: number
    description: string
    descoFk: number
    consumerCount?: number
}

export class ApplianceTypeApi {
    private readonly baseApi: XMysqlApi<ApplianceTypeDTO>
    private readonly fields = [
        'desco_fk',
        'appliance_type_pk',
        'repayment_rate',
        'full_price',
        'description'
    ]

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new XMysqlApi<ApplianceTypeDTO>('appliance_type', this.fields, client)
    }

    public async getAllFromDesco (descoKey: number): Promise<ApplianceType[] | Error> {
        return this.getAllAppliancePackages({ desco_fk: `${descoKey}` })
    }

    public async getAllForKeys (applianceTypeKeys: number[]): Promise<ApplianceType[] | Error> {
        if (applianceTypeKeys.length <= 0) return []

        const uniqueKeys = [...new Set(applianceTypeKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        return this.getAllAppliancePackages({ appliance_type_pk: `${stringOfKeys}` })
    }

    private async getAllAppliancePackages (condition?: Condition): Promise<ApplianceType[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition)
            : undefined

        const applianceTypes = await this.baseApi.getAllWithCustomEntity<ApplianceTypeDTO>({
            _fields: [...this.fields, 'consumer_count'].join(','),
            ...parsedCondition
        }, 'appliance_type_with_consumer_count')

        if (applianceTypes instanceof Error) {
            return applianceTypes
        }

        return applianceTypes.map(applianceType => this.parseDto(applianceType))
    }

    private parseDto (dto: ApplianceTypeDTO): ApplianceType {
        return {
            applianceTypePk: dto.appliance_type_pk,
            repaymentRate: dto.repayment_rate,
            fullPrice: dto.full_price,
            description: dto.description,
            descoFk: dto.desco_fk,
            consumerCount: dto.consumer_count
        }
    }
}
