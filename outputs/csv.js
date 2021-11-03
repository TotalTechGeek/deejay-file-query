
import * as csv from 'fast-csv'
import { Observable } from 'rxjs'
import { createOutStream } from './outStream.js'


/**
 * An RxJS operator that converts an Observable of objects to a CSV stream.
 * @param {string} [file] The name of the file to export to
 * @returns An observable that emits the CSV data.
 */
export const CSVOutput = (file) => source => new Observable(observer => {
    const outStream = csv.format({ headers: true })
    const fileStream = createOutStream(file, 'csv')
    outStream.pipe(fileStream, { end: true })

    source.subscribe({
        next: value => {
            outStream.write((typeof value !== 'object' || !value) ? {value} : value)
            observer.next(value)
        },
        error: error => {
            observer.error(error)
        },
        complete: () => {
            observer.complete()
        }
    })

    return () => {
        outStream.end()
    }
})
