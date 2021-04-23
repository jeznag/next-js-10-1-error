import { DateTime } from 'luxon'

import { Dictionary, Condition } from '@shared-types'
import { XMysqlApi, ProductType, ProductTypeName } from '@api'
import { HttpClient } from '@services'
/*
* On the Node entity the product field is nullable
* The following DTO relies on a left join to filter out any node without a product
* This guarantees we only retrieve nodes with products & their product types
* Therefore, product_fk & product_type fields are non-nullable for this type
*/
export type InstalledNodeDTO = {
    node_pk: number
    battery_capacity: number
    solar_capacity: number
    latitude: number
    longitude: number
    consumer_fk: number
    village_fk: number
    product_fk: number
    product_type_pk: number
    product_name: ProductTypeName
    release: string
    connected_at: string | null
}

/*
* An installed node guarantees the node has a linked product
*/
export type InstalledNode = {
    nodePk: number
    batteryCapacity: number
    solarCapacity: number
    consumerFk: number
    villageFk: number
    productFk?: number
    latitude: number
    longitude: number
    productType: ProductType
    connectedAt?: DateTime
}

export class InstalledNodeApi {
    private readonly baseApi: XMysqlApi<InstalledNodeDTO>
    private readonly fields = [
        'node_pk',
        'battery_capacity',
        'solar_capacity',
        'consumer_fk',
        'village_fk',
        'product_fk',
        'latitude',
        'longitude',
        'connected_at',
        'product_type_pk',
        'product_name',
        'release'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<InstalledNodeDTO>('installed_node_view', this.fields, client)
    }

    public async getAllFromVillages (villageKeys: number[]): Promise<InstalledNode[] | Error> {
        if (villageKeys.length <= 0) return []

        const uniqueKeys = [...new Set(villageKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        return this.getAllInstalledNodes({ village_fk: `${stringOfKeys}` })
    }

    public async getAllFromKeys (nodeKeys: number[]): Promise<InstalledNode[] | Error> {
        if (nodeKeys.length <= 0) return []

        const uniqueKeys = [...new Set(nodeKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        return this.getAllInstalledNodes({ node_pk: `${stringOfKeys}` })
    }

    public async getAllInstalledNodes (condition?: Condition): Promise<InstalledNode[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition)
            : undefined

        const nodes = await this.baseApi.getAllWithCustomEntity<InstalledNodeDTO>({
            _fields: this.fields.join(','),
            ...parsedCondition
        }, 'installed_node_view')

        if (nodes instanceof Error) return nodes

        return nodes.map(dto => this.parseNodeDto(dto))
    }

    private parseNodeDto (dto: InstalledNodeDTO): InstalledNode {
        return {
            nodePk: dto.node_pk,
            batteryCapacity: dto.battery_capacity,
            solarCapacity: dto.solar_capacity,
            consumerFk: dto.consumer_fk,
            villageFk: dto.village_fk,
            productFk: dto.product_fk ?? undefined,
            latitude: dto.latitude,
            longitude: dto.longitude,
            connectedAt: dto.connected_at !== null ? DateTime.fromISO(dto.connected_at, { zone: 'utc' }) : undefined,
            productType: {
                productTypePk: dto.product_type_pk,
                name: dto.product_name,
                release: dto.release
            }
        }
    }

    public static buildNodeDict (nodes: InstalledNode[]): Dictionary<InstalledNode> {
        const nodeDict: Dictionary<InstalledNode> = {}

        for (const node of nodes) {
            nodeDict[node.nodePk] = node
        }

        return nodeDict
    }
}
