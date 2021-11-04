import fs from 'fs'

/**
 * Gets the read stream for the given file path.
 * "$" will use the stdin instead.
 * 
 * @param {string} file 
 */
export function getReadStream (file) {
    if (file === '$') {
        return process.stdin
    }

    return fs.createReadStream(file)
}