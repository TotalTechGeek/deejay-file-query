

import { Observable } from 'rxjs'


/**
 * @returns An Observable that emits the console output.
 */
export const ConsoleOutput = () => source => new Observable(observer => {
    source.subscribe({
        next: value => {
            console.log(value)
            observer.next(value)
        },
        error: error => {
            observer.error(error)
        },
        complete: () => {
            observer.complete()
        }
    })
})

