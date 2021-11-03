
import { from } from 'rxjs'
import fs from 'fs'
import { csvObservable } from './csv-to-observer.js'
import { jsonObservable } from './json-to-observer.js'
import path from 'path'

/**
 * A factory function that creates an observable that emits the contents of a file.
 * @param {string} file 
 * @param {'csv'|'bigjson'|'json'} format 
 * @param {string} [additional] Additional information to be passed to the input observer
 * @returns An input observable.
 */
export function createInput (file, format, additional) {
    if (!format) {
        format = path.extname(file).substring(1).toLowerCase()
    }

    if (format === 'csv') {
        return csvObservable(file, additional)
    }

    // this format exists to allow for streaming from json files, rather than parsing it all in.
    // this is because if the json files are large, it could lead to a memory overflow.
    if (format === 'bigjson') {
        return jsonObservable(file, additional)
    }

    if (format === 'json') {
        const data = JSON.parse(fs.readFileSync(file))
        if (Array.isArray(data)) {
            return from(data)
        }
        return from([data])
    }

    throw new Error('Unrecognized Format')
}

