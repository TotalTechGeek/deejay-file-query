// @ts-check
import { tap, finalize, pipe } from 'rxjs'
import { createOutStream } from './outStream.js'

/**
 * An RxJS operator to emit JSON objects to a stream.
 * @param {string?} file The name of the file to export to.
 * @returns An observable that emits the JSON data to the specified file.
 */
export const JSONOutput = (file) => {
    /** @type {{ write: (str: string) => void, end: () => void }} For some reason it doesn't trust the type here. */
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
