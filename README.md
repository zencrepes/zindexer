# zindexer

Fetches data from GitHub, Jira, CircleCI (and more to come) and pushes it to an Elasticsearch instance.

_This project aims at replacing ZenCrepes's [github-indexer](https://github.com/zencrepes/github-indexer), adding abilities to fetch data from Jira (thus the need for a rename). _

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/zindexer.svg)](https://npmjs.org/package/zindexer)
[![CircleCI](https://circleci.com/gh/zencrepes/zindexer/tree/master.svg?style=shield)](https://circleci.com/gh/zencrepes/zindexer/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/zindexer.svg)](https://npmjs.org/package/zindexer)
[![License](https://img.shields.io/npm/l/zindexer.svg)](https://github.com/zencrepes/zindexer/blob/master/package.json)

<!-- toc -->

- [Introduction](#introduction)
- [Quick start with Docker](#quick-start-with-docker)
- [Configuration](#configuration)
- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Introduction

<!-- introduction -->

This script has been created to easily export Data from GitHub, Jira, CircleCI & more and import it into an Elasticsearch instance to be later used for data analytics (via ZenCrepes, Kibana or other)

Whenever possible (i.e. issues, milestones, projects), it loads data sorted by the updated date in descending order (most recent first) and will stop as soon as it find the same node already in Elasticsearch. This way, first load takes some time, then you can just cron it to keep your Elasticsearch instance up to date.

The overall logic is articulated around 3 stages:

- Identify sources (GitHub repositories and/or Jira Projects) to load data from
- [OPTIONAL] Select which sources to load data from by editing `~/.config/zindexer/sources.yml`
- Load data from the selected repositories (for example `zindxer gIssues` to load GitHub issues)

You can then re-run the scripts at regular interval to fetch the updated nodes.

Note: GitHub doesn't provide a mechanism to fetch new or updated labels so the script will (flush the index and) load all labels every time `gLabels` is executed.

# Documentation

You can find ZenCrepes documentation on [docs.zencrepes.io](https://docs.zencrepes.io/), issues should be created [here](https://github.com/zencrepes/zencrepes/issues).

This readme only contains developer-focused details.

# About Bit

Bit components are exported from Zindexer, those are used to share logic between the various ZenCrepes services.

- https://bit.dev/
- https://docs.bit.dev/docs/quick-start
- https://medium.com/javascript-in-plain-english/how-i-share-react-components-between-projects-3896d853cbee

```bash
bit login
bit status
bit tag config 0.0.11 / bit tag --all 0.0.11
bit build
bit export zencrepes.zindexer
```

Add new component:
```bash
bit add src/components/testingPerfs
```

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

- [`zindexer gIssues`](#zindexer-gissues)
- [`zindexer gLabels [FILE]`](#zindexer-glabels-file)
- [`zindexer gMilestones`](#zindexer-gmilestones)
- [`zindexer gProjects`](#zindexer-gprojects)
- [`zindexer gPullrequests`](#zindexer-gpullrequests)
- [`zindexer gReleases`](#zindexer-greleases)
- [`zindexer gRepos`](#zindexer-grepos)
- [`zindexer help [COMMAND]`](#zindexer-help-command)
- [`zindexer jIssues`](#zindexer-jissues)
- [`zindexer jProjects`](#zindexer-jprojects)
- [`zindexer sources [FILE]`](#zindexer-sources-file)

## `zindexer gIssues`

Github: Fetches issues data from configured sources

```
USAGE
  $ zindexer gIssues

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/gIssues.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/gIssues.ts)_

## `zindexer gLabels [FILE]`

describe the command here

```
USAGE
  $ zindexer gLabels [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/gLabels.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/gLabels.ts)_

## `zindexer gMilestones`

Github: Fetches milestones data from configured sources

```
USAGE
  $ zindexer gMilestones

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/gMilestones.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/gMilestones.ts)_

## `zindexer gProjects`

Github: Fetches projects data from configured sources

```
USAGE
  $ zindexer gProjects

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/gProjects.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/gProjects.ts)_

## `zindexer gPullrequests`

Github: Fetches Pullrequests data from configured sources

```
USAGE
  $ zindexer gPullrequests

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/gPullrequests.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/gPullrequests.ts)_

## `zindexer gReleases`

Github: Fetches releases data from configured sources

```
USAGE
  $ zindexer gReleases

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/gReleases.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/gReleases.ts)_

## `zindexer gRepos`

Github: Fetches repos data from configured sources

```
USAGE
  $ zindexer gRepos

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/gRepos.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/gRepos.ts)_

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

## `zindexer jIssues`

Jira: Fetches issues data from configured sources

```
USAGE
  $ zindexer jIssues

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/jIssues.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/jIssues.ts)_

## `zindexer jProjects`

Jira: Fetches project data from configured sources

```
USAGE
  $ zindexer jProjects

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/jProjects.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/jProjects.ts)_

## `zindexer sources [FILE]`

Manage sources of data

```
USAGE
  $ zindexer sources [FILE]

OPTIONS
  -a, --active                     Automatically make the new sources active by default
  -g, --ggrab=affiliated|org|repo  [default: affiliated] If Github, Select how to fetch repositories
  -h, --help                       show CLI help
  -l, --load                       Load active status from status file: CONFIG_DIR/sources.yml
  -o, --gorg=gorg                  If Github, organization login
  -r, --grepo=grepo                If Github, repository name
  -t, --type=JIRA|GITHUB           [default: GITHUB] Type of source (JIRA or GitHUB)
```

_See code: [src/commands/sources.ts](https://github.com/zencrepes/zindexer/blob/v0.0.1/src/commands/sources.ts)_

<!-- commandsstop -->
