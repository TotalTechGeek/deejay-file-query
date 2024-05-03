
// @ts-check

// @ts-ignore - It is odd that this is not detected as valid -- it is!
import { csvFormatStream } from '@datastream/csv'
import { tap, finalize, pipe } from 'rxjs'
import { createOutStream } from './outStream.js'

/**
 * An RxJS operator that converts an Observable of objects to a CSV stream.
 * @param {string?} file The name of the file to export to
 * @returns An observable that emits the CSV data.
 */
export const CSVOutput = (file) => {
    const fileStream = createOutStream(file, 'csv')
    const outStream = csvFormatStream()
    outStream.pipe(fileStream, { end: true })
    return pipe(
        tap(value => outStream.write((typeof value !== 'object' || !value) ? {value} : value)),
        finalize(() => outStream.end())
    )
}
