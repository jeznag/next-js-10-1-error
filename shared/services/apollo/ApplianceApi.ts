import { HttpClient } from '@services'
import { DateTime } from 'luxon'
import { ApiMetaData } from '@shared-types'
import { ApolloApi } from './ApolloApi'

export enum ApplianceState {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE'
}

export type ApplianceDTO = {
    uuid: string
    appliance_id: number
    appliance_type_id: number
    consumer_id: number
    lease_start_date: string | null
    outstanding_balance: number
    appliance_state: ApplianceState
}

export type Appliance = {
    uuid: string
    applianceTypeId: number
    consumerId: number
    leaseStartDate?: DateTime
    outstandingBalance: number
    applianceState: ApplianceState
}

export type NewApplianceParams = {
    applianceTypeId: number
    consumerId: number
}

export class ApplianceApi {
    private readonly baseApi: ApolloApi<ApplianceDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('appliances', client)
    }

    public async create (applianceUuid: string, createParams: NewApplianceParams, metaData?: ApiMetaData) {
        const data = {
            uuid: applianceUuid,
            appliance_type_id: createParams.applianceTypeId,
            consumer_id: createParams.consumerId,
            lease_start_date: DateTime.utc().toISO()
        }

        const result = await this.baseApi.create(data, metaData)

        if (result instanceof Error) {
            return result
        }

        return ApplianceApi.parseDto(result)
    }

    public static parseDto (dto: ApplianceDTO): Appliance {
        return {
            uuid: dto.uuid,
            applianceTypeId: dto.appliance_type_id,
            consumerId: dto.consumer_id,
            leaseStartDate: dto.lease_start_date
                ? DateTime.fromISO(dto.lease_start_date, { zone: 'utc' })
                : undefined,
            outstandingBalance: dto.outstanding_balance,
            applianceState: dto.appliance_state
        }
    }
}
