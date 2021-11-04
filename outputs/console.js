// @ts-check
import { tap, pipe } from 'rxjs'

/**
 * @returns An Observable that emits the console output.
 */
export const ConsoleOutput = () => pipe(
    tap(console.log)
)

