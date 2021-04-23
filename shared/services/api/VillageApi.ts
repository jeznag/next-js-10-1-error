import { Dictionary } from '@shared-types'

import { XMysqlApi } from './'
import { HttpClient } from '@services'

export type VillageDTO = {
    village_pk: number
    name: string
    desco_fk: number
    url_slug: string
    latitude: number
    longitude: number
    alias_prefix: string
}

export type Village = {
    villagePk: number
    name: string
    descoFk: number
    urlSlug: string
    latitude: number
    longitude: number
    aliasPrefix: string
}

/**
 * Note: This is the current list of properties (columns)
 * of the `village` table that can be updated through
 * Harvest. If ever you need to update another property
 * just update this type.
 */
export type UpdatableVillageProperties = {
    villageKey: number
    latitude?: number
    longitude?: number
}

export type VillageWithProductDTO = VillageDTO & {
    product_fk: number
}

export type VillageWithProduct = Village & {
    productFk: number
}

export class VillageApi {
    private readonly baseApi: XMysqlApi<VillageDTO>
    private readonly fields = [
        'village_pk',
        'name',
        'desco_fk',
        'url_slug',
        'latitude',
        'longitude',
        'alias_prefix'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi('village', this.fields, client)
    }

    public async getAllFromDesco (descoKey: number): Promise<Village[] | Error> {
        const data = {
            _where: `(desco_fk,eq,${descoKey})`
        }

        const villages = await this.baseApi.getAll(data)

        if (villages instanceof Error) return villages

        return villages.map(village => this.parseDto(village))
    }

    public async getFromKey (key: number): Promise<Village | Error | undefined> {
        const village = await this.baseApi.getFromKey(key)

        if (village instanceof Error || !village) return village

        return this.parseDto(village)
    }

    public async getFromVillageName (name: string): Promise<Village | Error | undefined> {
        const data = {
            _where: `(name,eq,${name})`,
            _size: 1
        }

        const villages = await this.baseApi.getAll(data)

        if (villages instanceof Error) return villages

        const village = villages[0]

        return (village !== undefined)
            ? this.parseDto(village)
            : undefined
    }

    public async getVillageWithProductsFromDescoKeys (descoKeys: number[]): Promise<VillageWithProduct[] | Error> {
        const uniqueDescoKeys = [...new Set(descoKeys)]

        const dataForJoin = {
            _join: 'n.node,_j,c.consumer,_j,v.village',
            _on1: '(n.consumer_fk,eq,c.consumer_pk)',
            _on2: '(c.village_fk,eq,v.village_pk)',
            _fields: 'n.product_fk,v.village_pk,v.name,v.desco_fk',
            _where: `(desco_fk,in,${uniqueDescoKeys.join(',')})`
        }

        const villages = await this.baseApi.getJoin<VillageWithProductDTO>(dataForJoin)

        if (villages instanceof Error) { return villages }

        return villages.map(village => ({
            villagePk: village.village_pk,
            name: village.name,
            descoFk: village.desco_fk,
            urlSlug: village.url_slug,
            productFk: village.product_fk,
            latitude: village.latitude,
            longitude: village.longitude,
            aliasPrefix: village.alias_prefix
        }))
    }

    public async findUsingNameAndDesco (name: string, descoKey: number): Promise<Village[] | Error> {
        const condition = { _where: `(desco_fk,eq,${descoKey})` }

        const rawVillages = await this.baseApi.getAllMatches('name', name, condition)
        if (rawVillages instanceof Error) return rawVillages

        return rawVillages.map(village => this.parseDto(village))
    }

    public async updateVillage (updatableProps: UpdatableVillageProperties) {
        // Skip update if all params are undefined
        if ([
            updatableProps.latitude,
            updatableProps.longitude
        ].every((param) => param === undefined)) {
            return true
        }

        const villageData = {
            latitude: updatableProps.latitude,
            longitude: updatableProps.longitude
        }

        return this.baseApi.updateFromKey(
            updatableProps.villageKey,
            villageData
        )
    }

    private parseDto (dto: VillageDTO): Village {
        return {
            villagePk: dto.village_pk,
            name: dto.name,
            descoFk: dto.desco_fk,
            urlSlug: dto.url_slug,
            latitude: dto.latitude,
            longitude: dto.longitude,
            aliasPrefix: dto.alias_prefix
        }
    }

    public static buildVillageDict (villages: Village[]): Dictionary<Village> {
        const villageDict: Dictionary<Village> = {}

        for (const village of villages) {
            villageDict[village.villagePk] = village
        }

        return villageDict
    }
}
