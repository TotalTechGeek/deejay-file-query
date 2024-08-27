// @ts-check
// @ts-ignore - It is odd that this is not detected as valid -- it is!
import ExcelJS from 'exceljs'
import { getReadStream } from './stream.js'
import { Observable } from "rxjs";
import querystring from 'querystring'
import { defineKey } from "./defineKey.js";



/**
 * Reads in the data from a XLSX file and emits values as they stream in.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the XLSX data.
 */
export function xlsxObservable (file, additional = '') {
    /** @type {Record<string, any>} */
    const options = querystring.parse(additional.replace('\\n', '\n').replace('\\r', '\r').replace(/false/, ''))

    if (typeof options.header === 'undefined') options.header = true
    else options.header = Boolean(options.header.trim())
    
    return defineKey(
        new Observable(observer => {
            // @ts-expect-error The typing is likely correct here.
            const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(getReadStream(file), {});
            workbookReader.read()
            
            let header

            // @ts-expect-error The typing is correct here.
            workbookReader.on('worksheet', worksheet => {
                worksheet.on('row', row => {
                    if (!options.header) return observer.next(row.values)
                    if (!header) return header = row.values
                    const obj = {}
                    if (options.includeSheet) obj._sheet = worksheet.name
                    for (let i = 0; i < header.length; i++) {
                        if (header[i]) obj[header[i]] = row.values[i]
                    }
                    observer.next(obj)
                })
            })

            // @ts-expect-error The typing is correct here.
            workbookReader.on('end', () => observer.complete())

            // @ts-expect-error The typing is correct here.
            workbookReader.on('error', err => observer.error(err))

            // @ts-expect-error The typing is correct here.
            return () => workbookReader.stream.close()
        }),
        file
    )
}

