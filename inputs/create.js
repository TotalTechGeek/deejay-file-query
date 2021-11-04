// @ts-check
import fs from 'fs'
import path from 'path'
import { from } from 'rxjs'
import { avroObservable } from './avro.js'
import { csvObservable } from './csv.js'
import { jsonObservable } from './json.js'

/**
 * A factory function that creates an observable that emits the contents of a file.
 * @param {string} file 
 * @param {'csv'|'bigjson'|'json'|'avro'} format 
 * @param {string} [additional] Additional information to be passed to the input observer
 * @returns An input observable.
 */
export function createInput (file, format, additional) {
    if (!format) {
        const extension = path.extname(file).substring(1).toLowerCase()
        if (extension !== 'csv' && extension !== 'json' && extension !== 'avro') {
            throw new Error('Unknown Input Format')
        }
        format = extension
    }

    if (format === 'avro') {
        return avroObservable(file, additional)
    }

    if (format === 'csv') {
        return csvObservable(file, additional)
    }

    // this format exists to allow for streaming from json files, rather than parsing it all in.
    // this is because if the json files are large, it could lead to a memory overflow.
    if (format === 'bigjson' || (format === 'json' && file === '$')) {
        return jsonObservable(file, additional)
    }

    if (format === 'json') {
        const data = JSON.parse(fs.readFileSync(file).toString())
        if (Array.isArray(data)) {
            return from(data)
        }
        return from([data])
    }

}

