import { HttpClient } from '@services'
import { Constants } from '@shared-types'
import { XMysqlApi } from './'

export type DescoDTO = {
    desco_pk: number
    name: string
    url_slug: string
}

export type Desco = {
    descoPk: number
    name: string
    urlSlug: string
}

export class DescoApi {
    private readonly baseApi: XMysqlApi<DescoDTO>
    private readonly fields = [
        'desco_pk',
        'name',
        'url_slug'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<DescoDTO>('desco', this.fields, client)
    }

    public async getOkraDesco (): Promise<Desco | Error | undefined> {
        return this.getFromName(Constants.OKRA_DESCO_NAME)
    }

    public async getFromName (name: string): Promise<Desco | Error | undefined> {
        const result = await this.baseApi.get({ _where: `(name,eq,${name})`, _size: 1 })

        if (result instanceof Error) {
            return result
        }

        return result.length > 0 ? this.parseDto(result[0]) : undefined
    }

    public async getFromKey (key: number): Promise<Desco | Error | undefined> {
        const result = await this.baseApi.getFromKey(key)

        if (result instanceof Error) {
            return result
        }

        return result ? this.parseDto(result) : undefined
    }

    public async getAll (): Promise<Array<Desco> | Error> {
        // Exclude deleted descos
        const condition = { _where: '(is_deleted,eq,0)' }

        const result = await this.baseApi.getAll(condition)

        if (result instanceof Error) {
            return result
        }

        return result.map(desco => this.parseDto(desco))
    }

    public async getDescoFromSlug (descoSlug: string): Promise<Desco | Error | undefined> {
        const result = await this.baseApi.get({ _where: `(url_slug,eq,${descoSlug})`, _size: 1 })

        if (result instanceof Error) {
            return result
        }

        return result.length > 0 ? this.parseDto(result[0]) : undefined
    }

    private parseDto (dto: DescoDTO): Desco {
        return {
            descoPk: dto.desco_pk,
            name: dto.name,
            urlSlug: dto.url_slug
        }
    }
}
