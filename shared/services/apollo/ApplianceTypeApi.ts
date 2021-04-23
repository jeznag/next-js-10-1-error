import { HttpClient } from '@services'
import { ApolloApi } from './ApolloApi'

export type ApplianceTypeDTO = {
    appliance_type_id: number
    desco_id: number
    repayment_rate: number
    full_price: number
    description: string
}

export type ApplianceType = {
    applianceTypeId: number
    descoId: number
    repaymentRate: number
    fullPrice: number
    description: string
}

export class ApplianceTypeApi {
    private readonly baseApi: ApolloApi<ApplianceTypeDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('appliance_types', client)
    }

    public async getAllFromDesco (descoId: number): Promise<ApplianceType[] | Error> {
        const results = await this.baseApi.getAll({ desco_id: descoId })

        if (results instanceof Error) {
            return results
        }

        return results.map(result => ApplianceTypeApi.parseDto(result))
    }

    public static parseDto (dto: ApplianceTypeDTO): ApplianceType {
        return {
            applianceTypeId: dto.appliance_type_id,
            descoId: dto.desco_id,
            repaymentRate: dto.repayment_rate,
            fullPrice: dto.full_price,
            description: dto.description
        }
    }
}
