// @ts-check
import { Observable } from "rxjs";
import { defineKey } from "./defineKey.js";

/**
 * @typedef {(import('stream').Readable | NodeJS.ReadWriteStream | import('fs').ReadStream | NodeJS.WritableStream) & { end?: Function }} CloseableStream
 */

/**
 * @typedef {CloseableStream | (() => CloseableStream)} ObservableStream
 */

/**
 * Converts a stream to an RxJS observable.
 * Takes ownership of the lifecycle of the stream (closes it upon completion)
 * 
 * @param {ObservableStream} stream 
 * @param {string} [key] Optional key to use for the observable.
 * @returns An RxJS observable built from the stream.
 */
export function streamToObservable (stream, key) {
    return defineKey(new Observable(observer => {
        const subscribedStream = typeof stream === 'function' ? stream() : stream

        subscribedStream
            .on('data', data => observer.next(data))
            .on('error', err => observer.error(err))
            .on('end', () => observer.complete())

        return () => subscribedStream.end && subscribedStream.end()
    }), key)
}