// @ts-check
import parser from 'stream-json' ;
import { getReadStream } from './stream.js'
import { streamToObservable } from './streamToObservable.js'
import StreamValues from 'stream-json/streamers/StreamValues.js'
import StreamArray from 'stream-json/streamers/StreamArray.js'
import Pick from 'stream-json/filters/Pick.js'
import { map } from 'rxjs';

/**
 * A mechanism that uses JSONStream to convert a JSON file into an Observable, which allows the data to be streamed in 
 * rather than consumed all at once, to save on memory.
 * @param {string} file The file to read data from.
 * @param {string} path A JSONPath in the JSON document that allows it to extract out specific pieces of information. 
 * @returns 
 */
export function jsonObservable (file, path = '*') {
    return streamToObservable(
        () => {
            if (path === '*' || path === 'array') return getReadStream(file).pipe(parser({ jsonStreaming: true })).pipe(StreamArray.streamArray())
            if (path === 'ndjson' || path === 'stream') return getReadStream(file).pipe(parser({ jsonStreaming: true })).pipe(StreamValues.streamValues())
            return getReadStream(file).pipe(parser({ jsonStreaming: true })).pipe(Pick.pick({ filter: path })).pipe(StreamValues.streamValues())
        }, 
        file
    ).pipe(
        map(i => i.value)
    )
}
