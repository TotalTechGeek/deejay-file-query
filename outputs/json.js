

import { Observable } from 'rxjs'
import { createOutStream } from './outStream.js'


/**
 * An RxJS operator to emit JSON objects to a stream.
 * @param {string} [file] The name of the file to export to.
 * @returns An observable that emits the JSON data to the specified file.
 */
export const JSONOutput = (file) => source => new Observable(observer => {
    const outStream = createOutStream(file, 'json')
    let first = true
    outStream.write('[')

    source.subscribe({
        next: value => {
            if (!first) outStream.write(',')
            outStream.write(JSON.stringify(value))
            first = false
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
        outStream.write(']')
        outStream.end()
    }
})
