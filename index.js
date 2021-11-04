#!/usr/bin/env node
// @ts-check
import { Command, Option } from 'commander'
import { dsl } from 'deejay-rxjs-dsl'
import { createInput } from './inputs/create.js'
import { createOutput } from './outputs/create.js'

const program = new Command()
program.version('1.0.5').name('deejay').description('A program written to allow you to use the deejay DSL on files to query out data.')

const formatOption = new Option('-f, --format <format>', 'The format of the file').choices(['json', 'csv', 'bigjson', 'avro'])
const outputOption = new Option('-x, --export <mode>', 'The output format').choices(['console', 'json', 'csv', 'avro']).default('console')

program.addOption(formatOption)
    .option('-i, --input <file>', 'The file to be processed', '$')
    .option('-c, --command <command>', 'The command to run', '')
    .option('-o, --output <file>', 'Output file')
    .addOption(outputOption)
    .option('-a, --additional <info>', 'Additional information for the file parser')
    

program.parse(process.argv)
const options = program.opts()

createInput(options.input, options.format, options.additional).pipe(
    // @ts-ignore This is correct.
    ...dsl(`${options.command};`),
    createOutput(options.output, options.export)
).subscribe()