// @ts-check
import {XMLParser} from 'fast-xml-parser'
import fs from 'fs'
import { from } from 'rxjs'
import { defineKey } from './defineKey.js'

/**
 * Reads in the data from a XML file.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the XML data.
 */
export function xmlObservable (file, additional) {
    if (file === '$') throw new Error('Reading XML from stdin is unsupported with this operator.')
    const data = fs.readFileSync(file)
    const parser = new XMLParser({
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        attributeNamePrefix: '_',
        alwaysCreateTextNode: true,
        textNodeName: 'value'
    })
    return defineKey(from([parser.parse(data)]), file)
}
