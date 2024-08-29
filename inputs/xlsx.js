// @ts-check
import { from } from "rxjs";
import querystring from 'querystring'
import { defineKey } from "./defineKey.js";
import xlsx from 'node-xlsx';

/**
 * Reads in the data from a XLSX file and emits values as they stream in.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the XLSX data.
 */
export function xlsxObservable (file, additional = '') {
    if (file === '$') throw new Error('Reading XLSX from stdin is unsupported with this operator.')

    /** @type {Record<string, any>} */
    const options = querystring.parse(additional.replace('\\n', '\n').replace('\\r', '\r').replace(/false/, ''))

    if (typeof options.header === 'undefined') options.header = true
    else options.header = Boolean(options.header.trim())
    
    const data = xlsx.parse(file)

    if (options.header) {
        let header 
        return defineKey(from(data.flatMap(i => {
            if (!header) header = i.data.shift()
            return i.data.map(j => {
                const obj = {}
                if (options.includeSheet) obj._sheet = i.name
                for (let index = 0; index < header.length; index++) obj[header[index]] = j[index]
                return obj
            })
        })), file)
    }
    
    return defineKey(from(data.flatMap(i => {
        if (options.includeSheet) return i.data.map(j => ({...j, sheet: i.name}))
        return i.data
    })), file)
}

