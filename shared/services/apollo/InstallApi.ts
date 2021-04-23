import { HttpClient } from '@services'
import { DateTime } from 'luxon'
import { ApiMetaData } from 'types/api'
import { ApolloApi, ApolloOptions } from './ApolloApi'
import { SiteRSO } from './SiteApi'

export type InstallDto = {
    node_uuid: string
    node_id: number
    consumer_id: number
    product_id: number
    battery_capacity: number
    solar_capacity: number
    latitude: number
    longitude: number
    package_type_id: number
    package_start_date: string | null
    removal_reason?: RemovalReason
}

export type Install = {
    nodeUuid: string
    consumerId: number
    productId: number
    batteryCapacity: number
    solarCapacity: number
    latitude: number
    longitude: number
    packageTypeId: number
    packageStartDate?: DateTime
    removal_reason?: RemovalReason
}

export type CreateInstallParams = {
    consumerId: number
    productId: number
    batteryCapacity: number
    solarCapacity: number
    longitude: number
    latitude: number
    packageTypeId: number
    packageStartDate: DateTime
    connectedSites: SiteRSO[]
}

export enum RemovalReason {
    Broken = 'BROKEN',
    Repossessed = 'REPOSSESSED',
    PineappleToEdamame = 'PINEAPPLE_TO_EDAMAME',
    DissatisfiedCustomer = 'DISSATISFIED_CUSTOMER',
    Unknown = 'UNKNOWN'
}

type InstallPatchDto = {
    replace_product?: {
        product_id: number
        removal_reason: RemovalReason
    }
    battery_capacity?: number
    solar_capacity?: number
    connected_consumer_uuids?: string[]
}

export class InstallApi {
    private readonly baseApi: ApolloApi<InstallDto>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('installs', client)
    }

    public async create (nodeUuid: string, installParams: CreateInstallParams, metaData?: ApiMetaData): Promise<Install | Error> {
        const data = {
            node_uuid: nodeUuid,
            consumer_id: installParams.consumerId,
            product_id: installParams.productId,
            package_type_id: installParams.packageTypeId,
            battery_capacity: installParams.batteryCapacity,
            solar_capacity: installParams.solarCapacity,
            package_start_date: installParams.packageStartDate.toISO(),
            longitude: installParams.longitude,
            latitude: installParams.latitude,
            connected_consumer_uuids: installParams.connectedSites.map(site => site.consumer.uuid)
        }

        const result = await this.baseApi.create(data, metaData)

        if (result instanceof Error) {
            return result
        }

        return this.parseDto(result)
    }

    public async update (nodeUuid: string, batteryCap?: number, solarCap?: number, connectedConsumerUuids?: string[], metaData?: ApiMetaData): Promise<Install | Error> {
        const data: InstallPatchDto = {
            battery_capacity: batteryCap,
            solar_capacity: solarCap,
            connected_consumer_uuids: connectedConsumerUuids
        }
        const options: ApolloOptions = { overrideEntityName: 'installs/node' }
        const result = await this.baseApi.update<any>(nodeUuid, data, options, metaData)

        if (result instanceof Error) {
            return result
        }

        return this.parseDto(result)
    }

    public async replaceProduct (nodeUuid: string, newProductId: number, removalReason: RemovalReason, metaData?: ApiMetaData): Promise<Install | Error> {
        const data: InstallPatchDto = {
            replace_product: {
                product_id: newProductId,
                removal_reason: removalReason
            }
        }

        const options: ApolloOptions = { overrideEntityName: 'installs/node' }
        const result = await this.baseApi.update<any>(nodeUuid, data, options, metaData)

        if (result instanceof Error) {
            return result
        }

        return this.parseDto(result)
    }

    public async removeProduct (nodeUuid: string, removalReason: RemovalReason, metaData?: ApiMetaData): Promise<Error | undefined> {
        const data = { removal_reason: removalReason }
        const options: ApolloOptions = { overrideEntityName: 'installs/node' }

        const result = await this.baseApi.delete(nodeUuid, data, options, metaData)

        if (result instanceof Error) {
            return result
        }
    }

    private parseDto (dto: InstallDto): Install {
        return {
            nodeUuid: dto.node_uuid,
            consumerId: dto.consumer_id,
            productId: dto.product_id,
            batteryCapacity: dto.battery_capacity,
            solarCapacity: dto.solar_capacity,
            latitude: dto.latitude,
            longitude: dto.longitude,
            packageTypeId: dto.package_type_id,
            packageStartDate: dto.package_start_date
                ? DateTime.fromISO(dto.package_start_date, { zone: 'utc' })
                : undefined
        }
    }
}
