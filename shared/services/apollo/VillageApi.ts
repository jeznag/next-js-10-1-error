import { HttpClient } from 'services/HttpClient'
import { ApolloApi } from './ApolloApi'

export type VillageDTO = {
    village_id: number,
    desco_id: number,
    village_name: string,
    url_slug: string
}

export type Village = {
    villageId: number,
    descoId: number,
    name: string,
    urlSlug: string
}

export class VillageApi {
    private readonly baseApi: ApolloApi<VillageDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('villages', client)
    }

    public async getAllFromDesco (descoId: number) {
        const results = await this.baseApi.getAll({ desco_id: descoId })

        if (results instanceof Error) {
            return results
        }

        return results.map(result => this.parseDto(result))
    }

    private parseDto (dto: VillageDTO): Village {
        return {
            villageId: dto.village_id,
            descoId: dto.desco_id,
            name: dto.village_name,
            urlSlug: dto.url_slug
        }
    }
}
