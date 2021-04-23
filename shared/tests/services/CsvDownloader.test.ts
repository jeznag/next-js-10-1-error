import FileSaver from 'file-saver'
import { CsvDownloader } from '@services'

interface MockCsvData {
    alias: string
    base_rate: number
}

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

describe('Testing CsvExporter class', () => {
    let mockCsvData: MockCsvData[]

    beforeAll(() => {
        mockCsvData = [
            {
                alias: 'SI-01',
                base_rate: 8
            }, {
                alias: 'SI-02',
                base_rate: 12
            }
        ]
    })

    describe('download()', () => {
        it('should download the generated CSV', () => {
            const expectedCsvFilename = 'mockExport'
            const expectedCsvData = '\ufeff"alias","base_rate"\n"SI-01",8\n"SI-02",12'
            const expectedHeaders = 'data:text/csv;charset=utf-8;header=present,'
            const expectedBlob = new Blob([expectedCsvData], { type: expectedHeaders })

            const csvDownloader = new CsvDownloader<MockCsvData>()
            csvDownloader.download(mockCsvData, expectedCsvFilename)

            const fileSaverSpy = jest.spyOn(FileSaver, 'saveAs').mockImplementation(() => true)

            expect(fileSaverSpy).toHaveBeenCalledWith(
                expectedBlob,
                expectedCsvFilename + '.csv'
            )
        })
    })
})
