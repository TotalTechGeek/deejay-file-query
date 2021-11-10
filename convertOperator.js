// @ts-check
import { Observable } from "rxjs"

/**
 * Because the DSL currently does not have support to specify the format
 * of the operator, this exists solely for the purpose of evaluating the 
 * first argument. 
 * 
 * @template T
 * @param {(...args: any[]) => Observable<T>} operator 
 */
export default function convertOperator (operator) {
    return (...args) => {
        if (typeof args[0] === 'function')
            args[0] = args[0]()
        return operator(...args)
    }
}

/**
 * Because the DSL currently does not have support to specify the format
 * of the operator, this exists solely for the purpose of evaluating the 
 * first argument. 
 * 
 * @template T 
 * @param {T} operators 
 * @returns {T}
 */
export function convertOperators (operators) {
    // @ts-ignore I promise this is correct.
    return Object.keys(operators).reduce((acc, key) => {
        acc[key] = convertOperator(operators[key])
        return acc
    }, {})
}