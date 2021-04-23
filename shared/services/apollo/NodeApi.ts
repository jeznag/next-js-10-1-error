import { Coords } from 'shared/types'

import { HttpClient } from '@services/HttpClient'
import { ApiMetaData } from 'types/api'
import { ApolloApi } from './ApolloApi'

export enum BatteryType {
    LeadAcid = 'LEAD_ACID',
    Lithium = 'LITHIUM'
}

export type NodeDTO = {
    uuid: string
    node_id: number
    consumer_id: number
    product_id: number | null
    latitude: number
    longitude: number
    battery_capacity: number
    solar_capacity: number
    disable_alert_engine: boolean
    prod_port_enabled: boolean | null
    battery_type: BatteryType
}

export type Node = {
    uuid: string
    consumerId: number
    productId?: number
    latitude: number
    longitude: number
    batteryCapacity: number
    solarCapacity: number
    disableAlertEngine: boolean
    prodPortEnabled?: boolean
    batteryType: BatteryType
}

type UpdatableNodeProperties = {
    batteryCapacity?: number
    solarCapacity?: number
    location?: Coords
}

export class NodeApi {
    private readonly baseApi: ApolloApi<NodeDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('nodes', client)
    }

    public async update (nodeUuid: string, params: UpdatableNodeProperties, metadata?: ApiMetaData) {
        const data = {
            battery_capacity: params.batteryCapacity,
            solar_capacity: params.solarCapacity,
            latitude: params.location?.lat,
            longitude: params.location?.lng
        }

        const result = await this.baseApi.update(nodeUuid, data, undefined, metadata)

        if (result instanceof Error) {
            return result
        }

        return NodeApi.parseDto(result)
    }

    public static parseDto (dto: NodeDTO): Node {
        return {
            uuid: dto.uuid,
            consumerId: dto.consumer_id,
            productId: dto.product_id ?? undefined,
            latitude: dto.latitude,
            longitude: dto.longitude,
            batteryCapacity: dto.battery_capacity,
            solarCapacity: dto.solar_capacity,
            disableAlertEngine: dto.disable_alert_engine,
            prodPortEnabled: dto.prod_port_enabled ?? undefined,
            batteryType: dto.battery_type
        }
    }
}
