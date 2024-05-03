// @ts-check
import avro from 'avsc'
import { streamToObservable } from './streamToObservable.js'
import { getReadStream } from './stream.js'
/**
 * Reads in the data from a avro file and emits values as they stream in.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the avro data.
 */
export function avroObservable (file, additional) {
    return streamToObservable(
        () => getReadStream(file).pipe(new avro.streams.BlockDecoder()), 
        file
    )
}
