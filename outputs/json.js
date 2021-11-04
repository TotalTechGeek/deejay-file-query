// @ts-check
import { tap, finalize, pipe } from 'rxjs'
import { createOutStream } from './outStream.js'

/**
 * An RxJS operator to emit JSON objects to a stream.
 * @param {string} [file] The name of the file to export to.
 * @returns An observable that emits the JSON data to the specified file.
 */
export const JSONOutput = (file) => {
    const outStream = createOutStream(file, 'json')
    let first = true
    outStream.write('[')
    return pipe(
        tap(value => {
            if (!first) outStream.write(',')
            outStream.write(JSON.stringify(value))
            first = false        
        }),
        finalize(() => {
            outStream.write(']')
            outStream.end()
        })
    )
}
