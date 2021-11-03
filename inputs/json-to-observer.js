import JSONStream from 'JSONStream'
import fs from 'fs'
import { Observable } from 'rxjs'

/**
 * A mechanism that uses JSONStream to convert a JSON file into an Observable, which allows the data to be streamed in 
 * rather than consumed all at once, to save on memory.
 * 
 * @param {string} file The file to read data from.
 * @param {string} path A JSONPath in the JSON document that allows it to extract out specific pieces of information. 
 * @returns 
 */
export function jsonObservable (file, path = '*') {
    return new Observable(observer => {
        const stream = fs.createReadStream(file)
            .pipe(JSONStream.parse(path))
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
