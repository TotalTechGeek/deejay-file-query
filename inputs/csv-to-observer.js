// @ts-check
import csv from 'fast-csv'
import fs from 'fs'
import { Observable } from 'rxjs'

/**
 * Reads in the data from a CSV file and emits values as they stream in.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the CSV data.
 */
export function csvObservable (file, additional) {
    return new Observable(observer => {
        const stream = fs.createReadStream(file)
            .pipe(csv.parse({ headers: true }))
            .on('data', (data) => {
                observer.next(data)   
            })
            .on('end', () => {
                observer.complete()
            })
            .on('error', error => {
                observer.error(error)
            })

        return () => {
            stream.end()
        }
    })

}
