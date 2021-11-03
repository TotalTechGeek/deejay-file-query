# Deejay File Query Tool

```txt
deejay --help
```

Produces

```txt
Usage: deejay [options]

A program written to allow you to use the deejay DSL on files to query out data.

Options:
  -V, --version            output the version number
  -f, --format <format>    The format of the file (choices: "json", "csv", "bigjson")
  -i, --input <file>       The file to be processed
  -c, --command <command>  The command to run (default: "")
  -o, --output <file>      Output file
  -x, --export <mode>      The output format (choices: "console", "json", "csv", default: "console")
  -a, --additional <info>  Additional information for the file parser
  -h, --help               display help for command
```

---

## Query Language

Additional documentation coming soon. Uses the query language from `deejay-rxjs-dsl`.

### Examples

```txt
deejay -i file.csv -c "average @.age"
```

Produces:

```txt
32.5
```

Complicated Query (getting counts of people who share a first name):

```txt
deejay -i file.json -c "mergeMap @.people; reduce groupBy($.accumulator, $.current, split($.name, ' ').0, $.accumulator+1, 0), {}; mergeMap toPairs(@); filter @.1 > 1; map ({ name: @.0, count: @.1 })" -x csv
```

```csv
name,count
Mike,3
Kevin,2
```
