import { DateTime } from 'luxon'

import {
    XMysqlApi,
    FirmwareApi,
    ProductTypeApi,
    ProductTypeName,
    VillageApi
} from './'
import { Logger, HttpClient } from '@services'

export type ProductDTO = {
    product_pk: number
    uuid: string
    product_type_fk: number
    firmware_fk: number | null
    desco_fk: number
    connected_at: string | null
}

export type CompleteProductDTO = ProductDTO & {
    product_type_name?: ProductTypeName
    product_type_release?: string
    firmware_version?: string
    village_fk?: number
    village_name?: string
}

export type Product = {
    productPk: number
    uuid: string
    productTypeFk: number
    firmwareFk?: number
    descoFk: number
    connectedAt?: DateTime
    productTypeName?: ProductTypeName
    productTypeRelease?: string
    firmwareVersion?: string
    villageFk?: number
    villageName?: string
}

export class ProductApi {
    private readonly baseApi: XMysqlApi<ProductDTO>
    private readonly fields = [
        'product_pk',
        'uuid',
        'product_type_fk',
        'firmware_fk',
        'desco_fk',
        'connected_at'
    ]

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new XMysqlApi<ProductDTO>('product', this.fields, client)
    }

    /*
    * This function retrieves all products for a desco and also
    * joins the related entities: Firmware, ProductType, and Village
    * Total API calls is 4, although each will reoccur if more then 99 rows exist
    */
    public async getAllFromDesco (descoKey: number): Promise<Product[] | Error> {
        const rawProducts = await this.baseApi.getAll({ _where: `(desco_fk,eq,${descoKey})` })

        return (rawProducts instanceof Error)
            ? rawProducts
            : this.fillWithDetailsFromOtherTables(rawProducts)
    }

    public async getFromKeys (productKeys: number[]): Promise<Product[] | Error> {
        const rawProducts = await this.baseApi.getAll({ _where: `(product_pk,in,${productKeys})` })

        return (rawProducts instanceof Error)
            ? rawProducts
            : this.fillWithDetailsFromOtherTables(rawProducts)
    }

    public async getFromKey (productKey: number): Promise<Product | Error | undefined> {
        const rawProduct = await this.baseApi.getFromKey(productKey)

        if (rawProduct instanceof Error) {
            return rawProduct
        }

        if (!rawProduct) {
            Logger.error(new Error(`Cannot find product with key ${[productKey]}`))
            return undefined
        }

        const products = await this.fillWithDetailsFromOtherTables([rawProduct])

        return (products instanceof Error)
            ? products
            : products[0]
    }

    public async findUsingUuidAndDesco (uuid: string, descoKey: number): Promise<Product[] | Error> {
        const condition = { _where: `(desco_fk,eq,${descoKey})` }

        const rawProducts = await this.baseApi.getAllMatches('uuid', uuid, condition)
        if (rawProducts instanceof Error) return rawProducts

        return this.fillWithDetailsFromOtherTables(rawProducts)
    }

    private async fillWithDetailsFromOtherTables (products: ProductDTO[]): Promise<Product[] | Error> {
        const firmwareApi = new FirmwareApi(this.client)
        const productTypeApi = new ProductTypeApi(this.client)
        const villageApi = new VillageApi(this.client)

        const firmwareKeys: number[] = []
        const productTypeKeys: number[] = []
        const descoKeys = new Set<number>()

        for (const product of products) {
            if (product.firmware_fk) firmwareKeys.push(product.firmware_fk)
            productTypeKeys.push(product.product_type_fk)
            descoKeys.add(product.desco_fk)
        }

        const firmwarePromise = firmwareApi.getAllFromKeys(firmwareKeys)
        const productTypePromise = productTypeApi.getAllFromKeys(productTypeKeys)
        const villagePromise = villageApi.getVillageWithProductsFromDescoKeys([...descoKeys])

        const [firmwares, productTypes, villages] = await Promise.all([firmwarePromise, productTypePromise, villagePromise])

        if (firmwares instanceof Error) return firmwares
        if (productTypes instanceof Error) return productTypes
        if (villages instanceof Error) return villages

        return products.map((product: ProductDTO): Product => {
            const firmware = firmwares.find(firmware => firmware.firmware_pk === product.firmware_fk)
            const productType = productTypes.find(productType => productType.productTypePk === product.product_type_fk)
            const village = villages.find(village => village.productFk === product.product_pk)

            return this.buildProduct({
                ...product,
                firmware_version: firmware?.version,
                product_type_name: productType?.name,
                product_type_release: productType?.release,
                village_fk: village?.villagePk,
                village_name: village?.name
            })
        })
    }

    private buildProduct (dto: CompleteProductDTO): Product {
        return {
            productPk: dto.product_pk,
            uuid: dto.uuid,
            productTypeFk: dto.product_type_fk,
            firmwareFk: dto.firmware_fk ?? undefined,
            descoFk: dto.desco_fk,
            connectedAt: dto.connected_at !== null ? DateTime.fromISO(dto.connected_at, { zone: 'utc' }) : undefined,
            productTypeName: dto.product_type_name,
            productTypeRelease: dto.product_type_release,
            firmwareVersion: dto.firmware_version,
            villageFk: dto.village_fk,
            villageName: dto.village_name
        }
    }
}
