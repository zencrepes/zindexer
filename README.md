zindexer
========

Fetches data from GitHub, Jira and pushes it to Elasticsearch

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/zindexer.svg)](https://npmjs.org/package/zindexer)
[![Downloads/week](https://img.shields.io/npm/dw/zindexer.svg)](https://npmjs.org/package/zindexer)
[![License](https://img.shields.io/npm/l/zindexer.svg)](https://github.com/zencrepes/zindexer/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g zindexer
$ zindexer COMMAND
running command...
$ zindexer (-v|--version|version)
zindexer/0.0.1 darwin-x64 node-v12.13.0
$ zindexer --help [COMMAND]
USAGE
  $ zindexer COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`zindexer hello [FILE]`](#zindexer-hello-file)
* [`zindexer help [COMMAND]`](#zindexer-help-command)
* [`zindexer sources [FILE]`](#zindexer-sources-file)

## `zindexer hello [FILE]`

describe the command here

```
USAGE
  $ zindexer hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ zindexer hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/hello.ts)_

## `zindexer help [COMMAND]`

display help for zindexer

```
USAGE
  $ zindexer help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `zindexer sources [FILE]`

describe the command here

```
USAGE
  $ zindexer sources [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/sources.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/sources.ts)_
<!-- commandsstop -->
