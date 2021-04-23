import { Condition } from '@shared-types'

import { XMysqlApi } from './XMysqlApi'
import { HttpClient } from '@services'

export type GridLineDTO = {
    grid_line_pk: number
    node_a_fk: number
    a_latitude: number
    a_longitude: number
    consumer_a_fk: number
    node_b_fk: number
    b_latitude: number
    b_longitude: number
    village_fk: number
}

export type GridLine = {
    gridLinePk: number
    latitudeA: number
    longitudeA: number
    latitudeB: number
    longitudeB: number
    villagePk: number
}

export class GridLineApi {
    private readonly baseApi: XMysqlApi<GridLineDTO>
    private readonly fields = [
        'grid_line_pk',
        'a_latitude',
        'a_longitude',
        'b_latitude',
        'b_longitude',
        'village_fk'
    ]

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new XMysqlApi<GridLineDTO>('grid_line', this.fields, client)
    }

    public async getAllFromVillages (villageKeys: number[]): Promise<GridLine[] | Error> {
        if (villageKeys.length <= 0) return []

        const uniqueKeys = [...new Set(villageKeys)]
        const stringOfKeys = uniqueKeys.join(',')

        return this.getAllGridLines({ village_fk: `${stringOfKeys}` })
    }

    private async getAllGridLines (condition: Condition): Promise<GridLine[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition)
            : undefined

        const gridLines = await this.baseApi.getAllWithCustomEntity<GridLineDTO>({
            _fields: this.fields.join(','),
            ...parsedCondition
        }, 'grid_line_coordinates_view')

        if (gridLines instanceof Error) {
            return gridLines
        }

        return gridLines.map(gridline => this.parseGridLinesDto(gridline))
    }

    private parseGridLinesDto (dto: GridLineDTO): GridLine {
        return {
            gridLinePk: dto.grid_line_pk,
            latitudeA: dto.a_latitude,
            longitudeA: dto.a_longitude,
            latitudeB: dto.b_latitude,
            longitudeB: dto.b_longitude,
            villagePk: dto.village_fk
        }
    }
}
