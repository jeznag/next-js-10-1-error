import { XMysqlApi } from './'
import { HttpClient } from '@services'

export enum ProductTypeName {
    Edamame = 'EDAMAME',
    Pineapple = 'PINEAPPLE'
}

export type ProductTypeDTO = {
    product_type_pk: number
    name: ProductTypeName
    release: string
}

export type ProductType = {
    productTypePk: number
    name: ProductTypeName
    release: string
}

export class ProductTypeApi {
    private readonly baseApi: XMysqlApi<ProductTypeDTO>
    private readonly fields = [
        'product_type_pk',
        'name',
        'release'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi('product_type', this.fields, client)
    }

    public async getAllFromKeys (productTypeKeys: number[]): Promise<ProductType[] | Error> {
        const uniqueKeys = [...new Set(productTypeKeys)]
        const stringOfKeys = uniqueKeys.join(',')
        const productTypes = await this.baseApi.getAll({ _where: `(product_type_pk,in,${stringOfKeys})` })

        if (productTypes instanceof Error) return productTypes

        return productTypes.map(productType => this.parseDto(productType))
    }

    private parseDto (dto: ProductTypeDTO) {
        return {
            productTypePk: dto.product_type_pk,
            name: dto.name,
            release: dto.release
        }
    }
}
