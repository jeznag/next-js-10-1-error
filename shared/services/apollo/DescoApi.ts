import { HttpClient } from '@services'
import { ApolloApi } from './ApolloApi'

export type DescoDTO = {
    desco_id: number,
    name: string,
    url_slug: string,
    is_deleted: number
}

export type Desco = {
    descoId: number,
    name: string,
    urlSlug: string,
    isDeleted: boolean
}

export class DescoApi {
    private readonly baseApi: ApolloApi<DescoDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('descos', client)
    }

    public async getAll () {
        const results = await this.baseApi.getAll({ is_deleted: 0 })

        if (results instanceof Error) {
            return results
        }

        return results.map(result => this.parseDto(result))
    }

    public async getFromId (id: number): Promise<Desco | Error> {
        const result = await this.baseApi.getFromId(id)

        if (result instanceof Error) {
            return result
        }

        return this.parseDto(result)
    }

    private parseDto (dto: DescoDTO): Desco {
        return {
            descoId: dto.desco_id,
            name: dto.name,
            urlSlug: dto.url_slug,
            isDeleted: dto.is_deleted === 1
        }
    }
}
