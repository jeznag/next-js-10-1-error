import { HttpClient } from '@services'
import { XMysqlApi } from './'

export type Firmware = {
    firmware_pk: number
    version: string
    product_type_fk: number
}

export class FirmwareApi {
    private readonly baseApi: XMysqlApi<Firmware>
    private readonly fields = [
        'firmware_pk',
        'version',
        'product_type_fk'
    ]

    constructor (client?: HttpClient) {
        this.baseApi = new XMysqlApi<Firmware>('firmware', this.fields, client)
    }

    public async getAllFromKeys (firmwareKeys: number[]): Promise<Firmware[] | Error> {
        const uniqueKeys = [...new Set(firmwareKeys)]
        const stringOfKeys = uniqueKeys.join(',')
        return this.baseApi.getAll({ _where: `(firmware_pk,in,${stringOfKeys})` })
    }
}
