import { QRCodeGenerator, ItemForQRDownload } from '@services'
import FileSaver from 'file-saver'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

describe('Testing QRCodeDownloader class', () => {
    let mockData: ItemForQRDownload[]

    beforeEach(() => {
        mockData = [{
            filename: 'testFilename',
            data: {
                bill_number: '-hGVAWm'
            }
        }]
    })

    describe('generateQRForDownload()', () => {
        it('should return the correct data URL from stringified object', async () => {
            const expectedDataUrl = ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAAAkl',
                'EQVR4AewaftIAAAYkSURBVO3BQY4cwZEAQffE/P/LvjzGqYDa7iFTUpjZH6x1icNaFzmsdZHDWhc5rHWRw1oXOax1kcNaFzmsdZ',
                'HDWhc5rHWRw1oXOax1kcNaFzmsdZHDWhf54UMqf1PFE5WpYlKZKp6oPKmYVKaKJypTxROVqeKJyt9U8YnDWhc5rHWRw1oX+eHLK',
                'r5J5YnKE5Wp4onKN6lMFVPFpDJVTBWfqPgmlW86rHWRw1oXOax1kR9+mcobFd9UMal8omJS+YTKE5UnFZ9QeaPiNx3WushhrYsc',
                '1rrID/9lKp5UPFF5o2JSeaNiUpkqJpX/Zoe1LnJY6yKHtS7yw385lScVTyo+UTGpvKHyv+Sw1kUOa13ksNZFfvhlFX+Tyhsqf1P',
                'FE5WpYlL5poqbHNa6yGGtixzWusgPX6byL1VMKlPFpDJVTCpTxaQyVUwqU8WkMlVMKlPFpDJVPFG52WGtixzWushhrYv88KGKf6',
                'liUpkqflPFGypvVEwqb1T8JzmsdZHDWhc5rHWRH36ZylTxROWbVKaKJypvqPxNFZPKpDJVTCrfVPFNh7UucljrIoe1LvLDh1Smi',
                'icqTyo+ofJE5UnFGxWTylQxqbyh8qTiicqTiicqU8WkMlV84rDWRQ5rXeSw1kV++MsqJpUnKm9UPFF5ojJVTCpTxROVN1T+JZV/',
                '6bDWRQ5rXeSw1kV++McqnlRMKk9Upoqp4jdVPFF5UjGpTBWTypOKT1RMKlPFNx3WushhrYsc1rrIDx+q+ITK36TyTSpTxaTypGJ',
                'SeaPiicpUMak8UZkqJpWp4hOHtS5yWOsih7Uu8sOXqTxReVLxRGWqmFQmlaliUpkqPqHypOITKlPFpPJGxRsqv+mw1kUOa13ksN',
                'ZF7A8+oPKk4onKJyqeqDypmFSmikllqphU3qh4Q+UTFZPKVDGpTBWTylTxicNaFzmsdZHDWhf54S9TeaNiUnmi8qRiUpkqJpUnK',
                'lPFpPIJlScVk8pU8aTiScWkMlV802GtixzWushhrYvYH3yRylQxqUwVk8qTikllqphUnlT8SypTxROVJxWTyhsVk8qTim86rHWR',
                'w1oXOax1EfuDX6TyRsUbKk8q3lCZKiaVJxW/SeWNikllqniiMlX8psNaFzmsdZHDWhf54ZdVTCpTxaTyTSpPKqaKNyomlaliUpk',
                'qnqi8UfFNFX/TYa2LHNa6yGGti9gffEDlmyqeqEwVk8onKt5QmSomlanim1SmiknlScUnVKaKTxzWushhrYsc1rqI/cEvUvmmii',
                'cqU8WkMlVMKlPFE5VvqphUpopPqEwVk8pU8Tcd1rrIYa2LHNa6yA+/rGJSmSomlaliUpkqpopJ5Y2KJypTxROVqWJSmVSmin9JZ',
                'aqYVKaKTxzWushhrYsc1rrIDx9SeVIxVTypmFSeqDypmFQmlScVU8UTlaliUpkqJpUnKlPFpDJVvFExqfxNh7UucljrIoe1LmJ/',
                '8ItUnlRMKlPFE5Wp4g2VqeKJylTxhsqTikllqniiMlW8oTJVTCpTxTcd1rrIYa2LHNa6yA8fUnlS8URlqphUpopPqEwVk8pU8Yb',
                'KGxWTyhOVN1S+qeI3Hda6yGGtixzWusgPH6r4RMWTit+kMlV8omJSmSreqHiiMlW8ofKGypOKTxzWushhrYsc1rrIDx9S+Zsq3l',
                'CZKiaVT6h8U8U3qUwVTyqeVEwq33RY6yKHtS5yWOsiP3xZxTepfJPKVDGpTBVTxRsqb6hMFZPKGxVvqEwVf9NhrYsc1rrIYa2L/',
                'PDLVN6oeKNiUpkq3qh4Q+VJxd+k8omKSWWqmCq+6bDWRQ5rXeSw1kV++B+j8qTiExWTylTxpOKbKp6oTCpPVKaKbzqsdZHDWhc5',
                'rHWRH/7DqTxReUPlmyqeqLxRMan8popJZVKZKj5xWOsih7UucljrIj/8sorfVDGpTBWTypOKSeVJxRsqU8Wk8omKb1KZKn7TYa2',
                'LHNa6yGGti/zwZSrr/69iUplUnqhMFZPKN6lMFZ84rHWRw1oXOax1EfuDtS5xWOsih7UucljrIoe1LnJY6yKHtS5yWOsih7Uucl',
                'jrIoe1LnJY6yKHtS5yWOsih7UucljrIv8H77vue4YtmC8AAAAASUVORK5CYII='].join('')

            const qrCodeGenerator = new QRCodeGenerator()
            const actualdataUrl = await qrCodeGenerator.generateDataUrl(mockData[0].data)

            expect(actualdataUrl).toStrictEqual(expectedDataUrl)
        })
    })

    describe('downloadAsZip()', () => {
        it('should download generated qr codes as zip', async () => {
            const qrCodeGenerator = new QRCodeGenerator()
            const expectedZipFilename = 'meralco-all-villages'
            const expectedBlob = new Blob([''], { type: 'application/zip' })

            const fileSaverSpy = jest.spyOn(FileSaver, 'saveAs')

            await qrCodeGenerator.downloadAsZip(mockData, expectedZipFilename)

            expect(fileSaverSpy).toHaveBeenCalledWith(
                expectedBlob,
                `${expectedZipFilename}.zip`
            )
        })
    })
})
