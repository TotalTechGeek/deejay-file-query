// @ts-check
import { Observable } from "rxjs";

/**
 * Converts a stream to an RxJS observable.
 * Takes ownership of the lifecycle of the stream (closes it upon completion)
 * 
 * @param {import('stream').Readable | NodeJS.ReadWriteStream} stream 
 * @returns An RxJS observable built from the stream.
 */
export function streamToObservable (stream) {
    return new Observable(observer => {
        stream.on('data', (data) => {
            observer.next(data)
        }).on('error', (err) => {
            observer.error(err)
        }).on('end', () => {
            observer.complete()
        })
        
        return () => {
            // @ts-ignore
            if (stream.end) stream.end()
        }
    })
}