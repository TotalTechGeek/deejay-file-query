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


export default {
    output: {
        format: 'cjs',
        file: 'dist/bundle.js',
    },
    
    plugins: [
        extension(process.env.DEEJAY_EXTENSION),
        hash(),
        nodeResolve(),
        commonjs(),
        replace({
            // This is a very explicit fix to deal with a rollup issue, but it's corrected with this.
            // These fixes should hopefully be rare.
            'const hexoid = require$$2;': 'const hexoid = require$$2["default"];',
            "import RDKafka from './inputs/rdkafka.js'": '',
            "RDKafka,": '',
            delimiters: ['', '']
        }),
        terser(),
        json()
    ],
};