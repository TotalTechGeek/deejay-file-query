// @ts-check
// @ts-ignore - It is odd that this is not detected as valid -- it is!
import { csvParseStream } from '@datastream/csv'
import { getReadStream } from './stream.js'
import { streamToObservable } from './streamToObservable.js'
import querystring from 'querystring'

/**
 * Reads in the data from a CSV file and emits values as they stream in.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the CSV data.
 */
export function csvObservable (file, additional = '') {
    const options = querystring.parse(additional.replace('\\n', '\n').replace('\\r', '\r').replace(/false/, ''))

    if (typeof options.header === 'string' && options.header) {
        const header = options.header 
        options.header = header.split(',')
        if (options.header.length === 1 && typeof options.delimiterChar === 'string') options.header = header.split(options.delimiterChar)
    }

    return streamToObservable(
        () => getReadStream(file).pipe(csvParseStream(options)), 
        file
    )
}

