// @ts-check
import { Observable } from 'rxjs'
import { defineKey } from './defineKey.js'
import parquetjs from '@dsnp/parquetjs'


/**
 * Reads in the data from a parquet file and emits values as they stream in.
 * @param {string} file 
 * @param {string} additional
 * @returns An Observable of the parquet data.
 */
export function parquetObservable (file, additional) {
    if (file === '$') throw new Error('Cannot read parquet from stdin')

    return defineKey(new Observable(observer => {
        let ended = false
        
        async function setup () {
            const reader = await parquetjs.ParquetReader.openFile(file)

            let filter = undefined
            if (additional) filter = additional.split(',')
            
            // @ts-ignore
            const cursor = reader.getCursor(filter)
            let record = null
            
            while (record = await cursor.next()) {
                observer.next(record)
                if (ended) break
            }
            reader.close()
            observer.complete()
        }

        setup().catch(err => observer.error(err))
        
        return () => {
            ended = true
        }
    }), file)
}
