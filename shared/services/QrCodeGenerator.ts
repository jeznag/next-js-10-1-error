import QRCode, { QRCodeToDataURLOptions, QRCodeRenderersOptions } from 'qrcode'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { Dictionary } from '@shared-types'

export type ItemForQRDownload = {
    filename: string
    data: string | Dictionary
}

export type QRDataForDownload = {
    filename: string
    dataUrl: string
}

export class QRCodeGenerator {
    private readonly zip: JSZip

    constructor () {
        this.zip = new JSZip()
    }

    public async generateDataUrl (data: string | Dictionary): Promise<string> {
        const options: QRCodeToDataURLOptions = {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg'
        }

        const serializedData = JSON.stringify(data)

        return QRCode.toDataURL(serializedData, options)
    }

    public async paintToCanvas (canvas: HTMLCanvasElement, data: string | Dictionary): Promise<void> {
        const options: QRCodeRenderersOptions = {
            errorCorrectionLevel: 'H'
        }

        const serializedData = typeof data === 'object' ? JSON.stringify(data) : data

        return QRCode.toCanvas(canvas, serializedData, options)
    }

    public async downloadAsZip (items: ItemForQRDownload[], filename = 'qr-codes') {
        const qrCodes = await Promise.all(items.map(async (item: ItemForQRDownload) => {
            const dataUrl = await this.generateDataUrl(item.data)
            return {
                filename: `${item.filename}.jpeg`,
                dataUrl: dataUrl.replace(/data:image\/[a-z]+?;base64,/, '')
            }
        }))

        qrCodes.forEach(qrCode => {
            this.zip.file(qrCode.filename, qrCode.dataUrl, { base64: true })
        })

        const blob = await this.zip.generateAsync({ type: 'blob' })

        FileSaver.saveAs(blob, `${filename}.zip`)
    }
}
