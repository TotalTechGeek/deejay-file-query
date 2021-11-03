const { Command, Option } = require('commander')
const { dsl } = require('deejay-rxjs-dsl')
const { from } = require('rxjs')
const fs = require('fs')
const path = require('path')
const { csvObservable } = require('./csv-to-observer')

const program = new Command()
program.version('0.0.2').name('deejay').description('A program written to allow you to use the deejay DSL on files to query out data.')

const formatOption = new Option('-f, --format <format>', 'The format of the file').choices(['json', 'csv'])

program.addOption(formatOption)
    .requiredOption('-i, --input <file>', 'The file to be processed')
    .requiredOption('-c, --command <command>', 'The command to run')
    .option('-s, --stringify', 'Stringify output')
    .option('-o, --output <file>', 'Output file')
    

program.parse(process.argv)
const options = program.opts()

function createObservableFromFile (file, format) {
    if (!format) {
        format = path.extname(file).substring(1).toLowerCase()
    }

    if (format === 'csv') {
        return csvObservable(file)
    }

    if (format === 'json') {
        const data = JSON.parse(fs.readFileSync(file))
        if (Array.isArray(data)) {
            return from(data)
        }
        return from([data])
    }

    throw new Error('Unrecognized Format')
}

function createOutStream (out, format = 'json') {
    if (out) {
        if(path.extname(out).substring(1).toLowerCase() !== format) {
            out += `.${format}`
        }
        return fs.createWriteStream(out)
    }
    return process.stdout
}


const outStream = createOutStream(options.output, options.outputFormat)
let first = true

const next = options.stringify ? i => {
    if (!first) outStream.write(',')
    outStream.write(JSON.stringify(i))
    first = false
} : console.log

if (options.stringify) outStream.write('[')

const complete = options.stringify ? () => outStream.write(']') : () => {}

createObservableFromFile(options.input, options.format).pipe(
    ...dsl(`${options.command};`)
).subscribe({
    next,
    complete
})