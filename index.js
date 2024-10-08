#!/usr/bin/env node
// @ts-check
import { Command, Option } from 'commander'
import { LogicEngine, AsyncLogicEngine } from 'json-logic-engine'
import { dsl, setupEngine } from 'deejay-rxjs-dsl'
import { convertOperators } from './convertOperator.js'
import { createInput, register, addInputs } from './inputs/create.js'
import { createOutput, Outputs } from './outputs/create.js'
import { pathToFileURL } from 'url'
import fs from 'fs'

const program = new Command()
program.version('1.0.35').name('deejay').description('A program written to allow you to use the deejay DSL on files to query out data.')

const formatOption = new Option('-f, --format <format>', 'The format of the file').choices(['json', 'parquet', 'csv', 'bigjson', 'avro', 'xml', 'xlsx', 'custom'])
const outputOption = new Option('-x, --export <mode>', 'The output format').choices(['console', 'json', 'csv', 'avro', 'parquet', 'none']).default('console')

program.addOption(formatOption)
    .option('-i, --input <file>', 'The file to be processed', '$')
    .option('-c, --command <command>', 'The command to run', '')
    .option('-p, --program <program>', 'The script to run', '')
    .option('-o, --output <file>', 'Output file')
    .option('-e, --extension <extension>', 'An extension file that can be parsed.')
    .addOption(outputOption)
    .option('-a, --additional <info>', 'Additional information for the file parser')

program.parse(process.argv)

/** @type {{ format: 'csv'|'bigjson'|'json'|'avro'|'xml'|'custom', input: string, additional: string, output: string, export: 'console'|'json'|'csv'|'avro', extension?: string, command: string, program: string }} */
const options = program.opts()

if (options.program && options.command) throw new Error('Cannot have both a command (-c) & a program (-p) set.')
if (options.program) options.command = fs.readFileSync(options.program, 'utf8').toString()

const engine = setupEngine(new LogicEngine())
addInputs(engine)

/** @type {AsyncLogicEngine} */ // @ts-ignore
const asyncEngine = setupEngine(new AsyncLogicEngine())
addInputs(asyncEngine)

const additionalOperators = convertOperators(Outputs)

if (options.extension) {
    // check if the extension is a file or a directory
    const stats = fs.lstatSync(`${options.extension}`)

    if (stats.isDirectory()) {
        options.extension = `${options.extension}/index.js`
    } else if (!stats.isFile()) {
        options.extension = `${options.extension}.js`
    }

    // @ts-ignore We want to use top-level await.
    const { asyncSetup, setup, inputs, operators, macros } = (await import(pathToFileURL(`${options.extension}`)))

    Object.assign(additionalOperators, operators || {})
    
    if (setup) { 
        setup(engine)
        setup(asyncEngine)
    }

    if (asyncSetup) asyncSetup(asyncEngine)

    if (inputs) {
        for (const input in inputs) register(input, inputs[input])
    }

    if (macros) {
        options.command = options.command.replace(/\r\n/g, '\n')
        for (const macro in macros) {
            options.command = options.command.replace(new RegExp(`(^|\n|;)\\s*${macro}\\s*(\n|;|$)`, 'g'), `\n${macros[macro]}\n`)
        }
    }
}

engine.addMethod('replace', ([data, search, replace]) => data.replace(new RegExp(search, 'g'), replace))

createInput(options.input, options.format, options.additional).pipe(
    // @ts-ignore This is correct.
    ...dsl(`${options.command};`, {
        additionalOperators,
        // @ts-ignore
        engine,
        asyncEngine
    }),
    createOutput(options.output, options.export)
).subscribe()