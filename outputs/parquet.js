// @ts-check

import avro from 'avsc';
import parquetjs from '@dsnp/parquetjs'
import { tap, finalize, pipe, mergeMap } from 'rxjs'
import { createOutStream } from './outStream.js'

const TYPE_CONVERSIONS = { string: 'UTF8', int: 'DOUBLE', long: 'INT64', float: 'DOUBLE', double: 'DOUBLE', boolean: 'BOOLEAN' };

/**
 * Converts an avro type to a thrift schema.
 * @param {*} type A type from avro.Type.forValue
 * @returns A type that can be used in a thrift schema, which will be used to generate a parquet.
 */
function convertToThriftSchema(type, top = true, orig = null) {
	if (!type) return type;
    
	if (type.type === 'record') {
		const fields = type.fields.reduce((acc, field) => {
			acc[field.name] = convertToThriftSchema(field.type, false);
			return acc;
		}, {}); 

		if (top) return fields
		return { fields }
	}

	if (type.type === 'array') {
		const items = convertToThriftSchema(type.items, false);
		if (items.type && !items.type.type) return { repeated: true, type: items.type };
		return {
			repeated: true,
			fields: items.fields,
		};
	}

    
	
	if (type in TYPE_CONVERSIONS) return { type: TYPE_CONVERSIONS[type], compression: 'GZIP' }
	if (type.logicalType === 'timestamp-millis') return { type: 'TIMESTAMP_MILLIS', compression: 'GZIP' }
    

    if (Array.isArray(type)) {
        if (type.includes('null')) {
            const result = convertToThriftSchema(type.filter(t => t !== 'null')[0], false)
            if (result.type) return { optional: true, type: result.type }
            throw new Error('Cannot convert to thrift schema');
        }
    }

	if (type.type === 'map' && type.values === 'string' && orig) {
		return Object.keys(orig).reduce((acc, key) => {
			acc[key] = { type: 'UTF8', compression: 'GZIP' }
			return acc
		}, {})

	}


	throw new Error(`Unknown type: ${JSON.stringify(type)}`);
}

/**
 * A custom avro type that converts a date to a long.
 * This is currently only available for the purpose of inferring a parquet schema.
 * But I may decide to support this optionally in the Avro Reader & Writer.
 */
class DateType extends avro.types.LogicalType {
	_fromValue(val) {
		return new Date(val);
	}

	_toValue(date) {
		return date instanceof Date ? +date : undefined;
	}

	_resolve(type) {
		if (avro.Type.isType(type, 'long', 'string', 'logical:timestamp-millis')) {
			return this._fromValue;
		}
	}
}

/** @ts-ignore @type {avro.Type} This is actually valid for the valueHook */
const DEFAULT_TYPE = undefined

/**
 * This function takes a value and infers a parquet schema from it.
 * This is useful for when you want to write a parquet file, but you don't have a schema.
 * @param {*} value 
 */
function inferParquetSchema(value) {
	const type = avro.Type.forValue(value, {
		valueHook: (obj, type) => {
			if (obj instanceof Date) {
				return avro.Type.forSchema({
					type: 'long',
					logicalType: 'timestamp-millis',
				}, {
					logicalTypes: {
						'timestamp-millis': DateType,
					},
				});
			}

			return DEFAULT_TYPE
		},
		logicalTypes: {
			'timestamp-millis': DateType,
		},
	}).toJSON();
	return convertToThriftSchema(type, true, value);
}

/**
 * An RxJS operator to emit parquet objects to a stream.
 * @param {string?} file The name of the file to export to.
 * @returns An observable that emits the parquet data to the specified file.
 */
export const ParquetOutput = (file) => {
	const fileStream = createOutStream(file, 'parquet')

    let type = null
	let promise = null
    let encoder = null

	/** @type {any[] | null} */
	let buffer = []

    // todo: add the ability to load a schema from a file by passing in "additional values"

    return pipe(
        tap(value => {
            if (!type) {
				const inferred = inferParquetSchema(value)
				// console.log(JSON.stringify(inferred, undefined, 2))
                type = new parquetjs.ParquetSchema(inferred)
                
                // @ts-ignore
               promise = parquetjs.ParquetWriter.openStream(type, fileStream).then(async stream => {
					stream.setRowGroupSize(122880) // Copying the DuckDB constant
					encoder = stream
					if (buffer) for (const item of buffer) await encoder.appendRow(item)
					buffer = null
				})
            }            
        }),
		mergeMap(async value => {
			if (!encoder) {
				if (buffer) buffer.push(value)
			}
			else await encoder.appendRow(value)	
			return value
		}, 1),
        finalize(async () => {
			await promise
			if (encoder) await encoder.close()
        })
    )
}

