// @ts-check
import { AvroOutput } from "./avro.js";
import { ConsoleOutput } from "./console.js"
import { CSVOutput } from "./csv.js"
import { JSONOutput } from "./json.js"
import { NoneOutput } from "./none.js";
import { ParquetOutput } from "./parquet.js";


/**
 * A factory for creating output operations.
 * @param {string?} file 
 * @param {'console'|'json'|'csv'|'avro'|'parquet'|'none'} format 
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

    if (format === 'parquet')
        return ParquetOutput(file)

    throw new Error(`Unknown format: ${format}`);
}


export const Outputs = {
    AvroOutput,
    ParquetOutput,
    ConsoleOutput,
    CSVOutput,
    JSONOutput,
    NoneOutput
}