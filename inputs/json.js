// @ts-check
import JSONStream from 'JSONStream'
import { getReadStream } from './stream.js'
import { streamToObservable } from './streamToObservable.js'

/**
 * A mechanism that uses JSONStream to convert a JSON file into an Observable, which allows the data to be streamed in 
 * rather than consumed all at once, to save on memory.
 * 
 * @param {string} file The file to read data from.
 * @param {string} path A JSONPath in the JSON document that allows it to extract out specific pieces of information. 
 * @returns 
 */
export function jsonObservable (file, path = '*') {
    const stream = getReadStream(file).pipe(JSONStream.parse(path))
    return streamToObservable(stream, file)
}
