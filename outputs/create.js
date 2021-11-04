// @ts-check
import { ConsoleOutput } from "./console.js"
import { CSVOutput } from "./csv.js"
import { JSONOutput } from "./json.js"

/**
 * A factory for creating output operations.
 * @param {string?} file 
 * @param {string} format 
 * @returns An operator to emit the output to a stream.
 */
export function createOutput (file, format) {
    if (format === 'console')
        return ConsoleOutput();
    
    if (format === 'json') 
        return JSONOutput(file);

    if (format === 'csv')
        return CSVOutput(file);

    throw new Error(`Unknown format: ${format}`);
}

