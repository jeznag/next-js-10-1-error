import { Coords } from 'shared/types'
import { DateTime } from 'luxon'
import { HttpClient } from '@services'
import { ApiMetaData } from 'types/api'
import { ApolloApi } from './ApolloApi'

export type ConsumerDTO = {
    consumer_id: number
    village_id: number
    package_type_id: number
    alias: string
    uuid: string
    first_name: string
    last_name: string
    mobile_number: string | null
    latitude: number
    longitude: number
    current_balance: number | null
    package_start_date: string | null
    package_end_date: string | null
    package_state: PackageState
}

export enum PackageState {
    ACTIVE = 'ACTIVE',
    DISABLED_CREDIT = 'DISABLED_CREDIT',
    DISABLED_DAILY = 'DISABLED_DAILY',
    BOOST = 'BOOST'
}

export type Consumer = {
    // TODO: We should deprecate consumerId to encourage use of the uuid instead
    // We can remove this property when we setup Signups for offline support
    consumerId: number
    villageId: number
    packageTypeId: number
    uuid: string
    alias: string
    firstName: string
    lastName: string
    mobileNumber?: string
    latitude: number
    longitude: number
    packageState: PackageState
    packageStartDate?: DateTime
    packageEndDate?: DateTime
    currentBalance?: number
}

export type UpdatableConsumerProperties = {
    consumerUuid: string
    firstName?: string
    lastName?: string
    packageTypeId?: number
    mobileNumber?: string | null
    packageStartDate?: DateTime | null
    location?: Coords
}

export class ConsumerApi {
    private readonly baseApi: ApolloApi<ConsumerDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('consumers', client)
    }

    public async update (updateParams: UpdatableConsumerProperties, metadata?: ApiMetaData): Promise<Consumer | Error> {
        const data = {
            first_name: updateParams.firstName,
            last_name: updateParams.lastName,
            mobile_number: updateParams.mobileNumber,
            package_type_id: updateParams.packageTypeId,
            package_start_date: updateParams.packageStartDate?.toISO()
        }

        const result = await this.baseApi.update(
            updateParams.consumerUuid,
            data,
            undefined,
            metadata
        )

        if (result instanceof Error) {
            return result
        }

        return ConsumerApi.parseDto(result)
    }

    public static parseDto (dto: ConsumerDTO): Consumer {
        return {
            consumerId: dto.consumer_id,
            villageId: dto.village_id,
            packageTypeId: dto.package_type_id ?? undefined,
            alias: dto.alias ?? undefined,
            uuid: dto.uuid,
            firstName: dto.first_name,
            lastName: dto.last_name,
            mobileNumber: dto.mobile_number ?? undefined,
            latitude: dto.latitude,
            longitude: dto.longitude,
            currentBalance: dto.current_balance ?? undefined,
            packageStartDate: dto.package_start_date
                ? DateTime.fromISO(dto.package_start_date, { zone: 'utc' })
                : undefined,
            packageState: dto.package_state
        }
    }
}
