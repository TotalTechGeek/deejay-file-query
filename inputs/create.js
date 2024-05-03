// @ts-check
import fs from 'fs'
import path from 'path'
import { from, Observable } from 'rxjs'
import { avroObservable } from './avro.js'
import { csvObservable } from './csv.js'
import { jsonObservable } from './json.js'
import { xmlObservable } from './xml.js'
import { parquetObservable } from './parquet.js'

/**
 * Extra Input Observables that are registered by an extension
 * @type {{ [key: string]: (...args: any[]) => Observable<any> }}
 */
const imports = {}

/**
 * Register an extra input observable.
 * @param {string} name 
 * @param {(...args: any[]) => Observable<any>} func 
 */
export function register (name, func) {
    imports[name] = func
}

/**
 * A factory function that creates an observable that emits the contents of a file.
 * @param {string} file 
 * @param {'csv'|'bigjson'|'json'|'avro'|'xml'|'parquet'|'custom'} format 
 * @param {any} [additional] Additional information to be passed to the input observer
 * @returns An input observable.
 */
export function createInput (file, format, additional) {
    if (!format) {
        const fileDetected = file.endsWith('.gz') ? file.substring(0, file.length - 3) : file
        const extension = path.extname(fileDetected).substring(1).toLowerCase()
        if (extension !== 'csv' && extension !== 'json' && extension !== 'avro' && extension !== 'xml' && extension !== 'parquet') {
            throw new Error(`Unknown Input Format: ${extension}`)
        }
        format = extension
    }

    if (format === 'parquet') {
        return parquetObservable(file, additional)
    }

    if (format === 'avro') {
        return avroObservable(file, additional)
    }

    if (format === 'csv') {
        return csvObservable(file, additional)
    }

    if (format === 'xml') {
        return xmlObservable(file, additional)
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

    if (format === 'custom') {
        if (!imports[file]) throw new Error('Unimplemented Custom Input')
        return imports[file](file, additional)
    }

    throw new Error('Unknown Input Format')
}

export function addInputs (engine) {
    // @ts-ignore
    engine.addMethod('csv', data => csvObservable(...[].concat(data)))
    // @ts-ignore
    engine.addMethod('xml', data => xmlObservable(...[].concat(data)))
    // @ts-ignore
    engine.addMethod('json', data => jsonObservable(...[].concat(data)))
    // @ts-ignore
    engine.addMethod('bigjson', data => jsonObservable(...[].concat(data)))
    // @ts-ignore
    engine.addMethod('avro', data => avroObservable(...[].concat(data)))
    // @ts-ignore
    engine.addMethod('parquet', data => parquetObservable(...[].concat(data)))
    return engine
}