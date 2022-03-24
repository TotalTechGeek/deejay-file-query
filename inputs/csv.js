// @ts-check
import csv from 'fast-csv'
import { getReadStream } from './stream.js'
import { streamToObservable } from './streamToObservable.js'

/**
 * Reads in the data from a CSV file and emits values as they stream in.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the CSV data.
 */
export function csvObservable (file, additional) {
    const stream = getReadStream(file).pipe(csv.parse({ headers: true }))
    return streamToObservable(stream, file)
}
