// @ts-check
import { AvroOutput } from "./avro.js";
import { ConsoleOutput } from "./console.js"
import { CSVOutput } from "./csv.js"
import { JSONOutput } from "./json.js"
import { NoneOutput } from "./none.js";


/**
 * A factory for creating output operations.
 * @param {string?} file 
 * @param {'console'|'json'|'csv'|'avro'} format 
 * @returns An operator to emit the output to a stream.
 */
export function createOutput (file, format) {
    if (format === 'console')
        return ConsoleOutput();
    
    if (format === 'json') 
        return JSONOutput(file);

    if (format === 'csv')
        return CSVOutput(file);

    if (format === 'avro')
        return AvroOutput(file)

    if (format === 'none')
        return NoneOutput()        

    throw new Error(`Unknown format: ${format}`);
}


export const Outputs = {
    AvroOutput,
    ConsoleOutput,
    CSVOutput,
    JSONOutput,
    NoneOutput
}