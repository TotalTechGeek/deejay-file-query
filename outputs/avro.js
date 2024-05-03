// @ts-check
import { tap, finalize, pipe } from 'rxjs'
import avro from 'avsc'
import { createOutStream } from './outStream.js'

function createNamingHook() {
    let index = 0;
    return function (schema) {
      switch (schema.type) {
        case 'enum':
        case 'fixed':
        case 'record':
          schema.name = `Auto${index++}`;
          break;
        default:
      }
    };
  }

/**
 * An RxJS operator to emit avro objects to a stream.
 * @param {string?} file The name of the file to export to.
 * @returns An observable that emits the avro data to the specified file.
 */
export const AvroOutput = (file) => {
    const fileStream = createOutStream(file, 'avro')

    /** @ts-ignore @type {avro.Type} */
    let type = null

    /** @ts-ignore @type {import('stream').Duplex} */
    let encoder = null

    // todo: add the ability to load a schema from a file by passing in "additional values"

    return pipe(
        tap(value => {
            if (!type) {
                type = avro.Type.forValue(value, {
                    // @ts-ignore - this is valid
                    typeHook: createNamingHook()
                })
                encoder = new avro.streams.BlockEncoder(type, { codec: 'deflate' })
                encoder.pipe(fileStream)
            }
            encoder.write(value)
        }),
        finalize(() => {
            encoder.end()
        })
    )
}
