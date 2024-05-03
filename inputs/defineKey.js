/**
 * @template T
 * Adds a key property to an object.
 * @param {T} obj 
 * @param {string | undefined} key 
 * @returns {T}
 */
export function defineKey (obj, key) {
    obj.key = key
    return obj
}