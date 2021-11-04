
// @ts-check
import csv from 'fast-csv'
import { tap, finalize } from 'rxjs'
import { createOutStream } from './outStream.js'

/**
 * An RxJS operator that converts an Observable of objects to a CSV stream.
 * @param {string} [file] The name of the file to export to
 * @returns An observable that emits the CSV data.
 */
export const CSVOutput = (file) => /** @param {import('rxjs').Observable} source */ source => {
    const fileStream = createOutStream(file, 'csv')
    const outStream = csv.format({ headers: true })
    outStream.pipe(fileStream, { end: true })
    return source.pipe(
        tap(value => outStream.write((typeof value !== 'object' || !value) ? {value} : value)),
        finalize(() => outStream.end())
    )
}
