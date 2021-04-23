import { Dictionary } from '@shared-types'
import FileSaver from 'file-saver'
import Papa, { UnparseObject } from 'papaparse'
/**
 * The CSV Downloader enables the user to pass an array of object
 * with identical keys to be downloaded as a CSV file.
 * It also accepts an object explicitly defining fields (the csv headers)
 * and data (an array of array that will populate the rows after the headers)
 */
export class CsvDownloader<T extends Dictionary<string | number>> {
    private readonly headers = 'data:text/csv;charset=utf-8;header=present,'
    private readonly fileExtension = '.csv'
    private readonly BOM = '\ufeff'

    public download (data: T[] | UnparseObject, filename = 'export') {
        const isFileSaverSupported = !!new Blob()
        if (!isFileSaverSupported) {
            throw new Error(`Cannot save file ${filename}. File saver not supported! `)
        }

        const csvData = Papa.unparse(data as T[])
        // Adding the BOM at the beginning of the CSV data
        // hints Excel that the file is UTF-8 encoded. This
        // would enable Excel to display non-ASCII characters
        // properly.
        // Reference: https://stackoverflow.com/a/155176/7389888
        const blob = new Blob([this.BOM + csvData], { type: this.headers })
        const csvFilename = filename + this.fileExtension

        FileSaver.saveAs(blob, csvFilename)
    }
}
