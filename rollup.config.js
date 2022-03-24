import hash from "rollup-plugin-hashbang";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser'

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
            ".option('-e, --extension <extension>', 'An extension file that can be parsed.')": ''
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
        commonjs(),
        nodeResolve(),
        terser()
    ],
};