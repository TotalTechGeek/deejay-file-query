import hash from "rollup-plugin-hashbang";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'

function extension (file) {
    const replacements = file ? {
        'if (options.extension) {': `
        import * as extension from '${file}';    
        {
        `,
        '(await import(pathToFileURL(`${options.extension}`)))': 'extension',
        'options.extension = findExtension(options.extension)': ''
    } : {
        'if (options.extension) {': 'if (false) {'
    }

    return replace({
        values: {
            ...replacements,
            ".option('-e, --extension <extension>', 'An extension file that can be parsed.')": '',
            // These are used to suppress the giant source code dump on a deejay error.
            'createInput(options.input': 'try { createInput(options.input',
            "createOutput(options.output, options.export)\r\n).subscribe()": "createOutput(options.output, options.export)\r\n).subscribe()} catch(err) { console.error(err) }",
            "createOutput(options.output, options.export)\n).subscribe()": "createOutput(options.output, options.export)\n).subscribe()} catch(err) { console.error(err) }"
        },
        delimiters: ['', ''],
        preventAssignment: true
    })
}


/**
 * The nodeResolve API does not allow a blacklist, and it allows a RegExp to be passed in.
 * However, it works by running ".test" on the RegExp,
 * so this workaround takes a RegExp, and hijacks the test method on it.
 * I had a different mechanism that used a funky regex, but this seemed simpler.
 * @param  {...string} arr 
 */
function forbid (...arr) {
    const regex = new RegExp('');
    const set = new Set(arr)
    regex.test = (pattern) => !set.has(pattern)
    return [regex]
}


export default {
    output: {
        format: 'cjs',
        file: 'dist/deejay.js',
    },
    
    plugins: [
        extension(process.env.DEEJAY_EXTENSION),
        hash(),
        nodeResolve({
            // We need to filter out binary dependencies here.
            // If something needs to be external, add the name to the list.
            resolveOnly: forbid(
                'node-rdkafka',
                'sqlite3'
            )
        }),
        commonjs(),
        replace({
            // This is a very explicit fix to deal with a rollup issue, but it's corrected with this.
            // These fixes should hopefully be rare.
            'const hexoid = require$$2;': 'const hexoid = require$$2["default"];',

            // We should now be able to correctly import binary dependencies like RDKafka.
            // "import RDKafka from './inputs/rdkafka.js'": '',
            // "RDKafka,": '',
            delimiters: ['', '']
        }),
        terser(),
        json()
    ],
};