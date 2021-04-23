import { HttpClient } from '@services'
import { ApolloApi } from './ApolloApi'
import { Consumer, ConsumerApi, ConsumerDTO } from './ConsumerApi'
import { Node, NodeApi, NodeDTO } from './NodeApi'
import { Appliance, ApplianceApi, ApplianceDTO } from './ApplianceApi'

type SiteGridLineDTO = {
    consumer_uuid: string,
    latitude: number,
    longitude: number
}

type SiteDTO = {
    consumer: ConsumerDTO
    nodes: NodeDTO[]
    grid_lines: SiteGridLineDTO[]
    appliances: ApplianceDTO[]
}

export type SiteGridLine = {
    consumerUuid: string,
    latitude: number,
    longitude: number
}

/**
 * RSO = Redux State Object
 * Redux state is limited to simple types, no complex types like classes.
 * This RSO type allows use to keep Sites in Redux state, and then
 * convert to the Site entity class when we need to extend its functionality.
 */
export type SiteRSO = {
    consumer: Consumer
    nodes: Node[]
    gridLines: SiteGridLine[]
    appliances: Appliance[]
}

export class SiteApi {
    private readonly baseApi: ApolloApi<SiteDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('sites', client)
    }

    public async getAllFromVillages (villageIds: number[]): Promise<SiteRSO[] | Error> {
        const uniqueIds = [...new Set(villageIds)].join(',')
        const results = await this.baseApi.getAll({ village_ids: uniqueIds })

        if (results instanceof Error) {
            return results
        }

        return results.map(dto => SiteApi.parseSiteDto(dto))
    }

    private static parseSiteDto (dto: SiteDTO): SiteRSO {
        return {
            consumer: ConsumerApi.parseDto(dto.consumer),
            nodes: dto.nodes.map(dto => NodeApi.parseDto(dto)),
            gridLines: dto.grid_lines.map(dto => SiteApi.parseSiteGridLineDto(dto)),
            appliances: dto.appliances.map(dto => ApplianceApi.parseDto(dto))
        }
    }

    private static parseSiteGridLineDto (dto: SiteGridLineDTO): SiteGridLine {
        return {
            consumerUuid: dto.consumer_uuid,
            latitude: dto.latitude,
            longitude: dto.longitude
        }
    }
}
