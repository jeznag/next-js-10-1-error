import { HttpClient } from '@services'
import {
    VillageApi,
    VillageWithProduct,
    ProductTypeName,
    ProductTypeDTO,
    Firmware,
    ProductApi,
    ProductDTO,
    Product,
    XMysqlApi
} from '@api'

describe('Testing ProductApi', () => {
    let productApi: ProductApi
    let httpMock: HttpClient

    beforeEach(() => {
        httpMock = new HttpClient()
        productApi = new ProductApi(httpMock)
    })

    it('should provide products with complete details from other tables', async () => {
        const mockFirmwares: Firmware[] = [
            {
                firmware_pk: 38,
                version: '1-4-3',
                product_type_fk: 6
            },
            {
                firmware_pk: 59,
                version: '2-0-2',
                product_type_fk: 6
            }
        ]

        const mockVillages: VillageWithProduct[] = [
            {
                productFk: 1,
                villagePk: 10,
                name: 'San Isidro',
                aliasPrefix: 'SI',
                descoFk: 6,
                urlSlug: 'san-isidro',
                latitude: 0,
                longitude: 0
            },
            {
                productFk: 2,
                villagePk: 10,
                name: 'San Isidro',
                aliasPrefix: 'SI',
                descoFk: 6,
                urlSlug: 'san-isidro',
                latitude: 0,
                longitude: 0
            }
        ]

        const mockProductTypesDTO: ProductTypeDTO[] = [
            {
                product_type_pk: 2,
                name: ProductTypeName.Edamame,
                release: 'C (R1)'
            }
        ]

        const expectedRawProducts: ProductDTO[] = [
            {
                product_pk: 1,
                uuid: '2490427859066643825308217',
                product_type_fk: 2,
                firmware_fk: 59,
                desco_fk: 6,
                connected_at: '2019-05-30T11:45:32.000Z'
            },
            {
                product_pk: 2,
                uuid: '6488120842420482808727863',
                product_type_fk: 2,
                firmware_fk: 38,
                desco_fk: 6,
                connected_at: '2018-10-16T09:53:40.000Z'
            }
        ]

        const expectedProduts: Product[] = expectedRawProducts.map(product => {
            const village = mockVillages.find(village => village.productFk === product.product_pk)
            const firmware = mockFirmwares.find(firmware => firmware.firmware_pk === product.firmware_fk)
            return productApi.buildProduct({
                product_pk: product.product_pk,
                uuid: product.uuid,
                product_type_fk: product.product_type_fk,
                firmware_fk: product.firmware_fk,
                desco_fk: product.desco_fk,
                connected_at: product.connected_at,
                product_type_name: mockProductTypesDTO[0].name,
                product_type_release: mockProductTypesDTO[0].release,
                firmware_version: firmware?.version,
                village_fk: village?.villagePk,
                village_name: village?.name
            })
        })

        jest.spyOn(VillageApi.prototype, 'getVillageWithProductsFromDescoKeys').mockResolvedValueOnce(mockVillages)
        jest.spyOn(XMysqlApi.prototype, 'getAll')
            .mockResolvedValueOnce(expectedRawProducts)
            .mockResolvedValueOnce(mockFirmwares)
            .mockResolvedValueOnce(mockProductTypesDTO)

        const actualProducts = await productApi.getAllFromDesco(123)
        if (actualProducts instanceof Error) throw actualProducts

        expect(actualProducts).toHaveLength(expectedProduts.length)
        expect(actualProducts[0]).toStrictEqual(expectedProduts[0])
        expect(actualProducts[1]).toStrictEqual(expectedProduts[1])
    })

    it('should throw an error if fetching raw products fails', async () => {
        jest.spyOn(XMysqlApi.prototype, 'getAll').mockResolvedValueOnce(new Error('bad connection'))

        const products = await productApi.getAllFromDesco(123)

        expect(products).toBeInstanceOf(Error)
    })

    it('should throw an error if fetching details from other tables fails', async () => {
        const expectedRawProducts = [
            {
                product_pk: 1,
                uuid: '2490427859066643825308217',
                product_type_fk: 2,
                firmware_fk: 59,
                firmware_download_status_fk: 12,
                desco_fk: 1,
                connected_at: '2019-05-30T11:45:32.000Z'
            }
        ]

        jest.spyOn(XMysqlApi.prototype, 'getAll')
            .mockResolvedValueOnce(expectedRawProducts)
            .mockResolvedValue(new Error('bad connection'))

        jest.spyOn(XMysqlApi.prototype, 'getJoin')
            .mockResolvedValue(new Error('bad connection'))

        const products = await productApi.getAllFromDesco(123)

        expect(products).toBeInstanceOf(Error)
    })
})
