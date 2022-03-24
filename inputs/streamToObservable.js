// @ts-check
import { Observable } from "rxjs";
import { defineKey } from "./defineKey.js";

/**
 * Converts a stream to an RxJS observable.
 * Takes ownership of the lifecycle of the stream (closes it upon completion)
 * 
 * @param {(import('stream').Readable | NodeJS.ReadWriteStream) & { end: () => void | null }} stream 
 * @param {string} [key] Optional key to use for the observable.
 * @returns An RxJS observable built from the stream.
 */
export function streamToObservable (stream, key) {
    return defineKey(new Observable(observer => {
        stream
            .on('data', data => observer.next(data))
            .on('error', err => observer.error(err))
            .on('end', () => {
                if (stream.end) stream.end() 
                observer.complete()
            })

        return () => stream.end && stream.end()
    }), key)
}