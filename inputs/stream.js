// @ts-check
import fs from 'fs'
import { createGunzip } from 'zlib'

/**
 * Gets the read stream for the given file path.
 * "$" will use the stdin instead.
 * 
 * @param {string} file 
 * @returns {import('fs').ReadStream | NodeJS.ReadStream}
 */
export function getReadStream (file) {
    if (file === '$') return process.stdin
    // @ts-expect-error This is correct, but we need to fix the typing for piping.
    if (file.endsWith('.gz')) return fs.createReadStream(file).pipe(createGunzip())
    return fs.createReadStream(file)
}