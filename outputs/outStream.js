// @ts-check
import path from 'path'
import fs from 'fs'

/**
 * Creates an output stream for the tool.
 * If no file is specified, it will write to stdout.
 * 
 * @param {string} [file] The file to write to. 
 * @param {string} format The extension that the file should have.
 * @returns A write stream to export data to.
 */
export function createOutStream (file, format = 'json') {
    if (file) {
        return fs.createWriteStream(correctExtension(file, format))
    }
    return process.stdout
}


/**
 * Corrects the extension on the file name.
 * @param {string} file The name of the file.
 * @param {string} format The extension that is expected
 * @returns 
 */
export function correctExtension (file, format = 'json') {
    // if the extension does not match the format, add it
    if(path.extname(file).substring(1).toLowerCase() !== format) {
        return `${file}.${format}`
    }
    return file
} 
