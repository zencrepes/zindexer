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

This script has been created to easily export Data from GitHub, Jira, CircleCI & more and import it into an Elasticsearch instance to be later used for data analystics (via ZenCrepes, Kibana or other)

Whenever possible (i.e. issues, milestones, projects), it loads data sorted by the updated date in descending order (most recent first) and will stop as soon as it find the same node already in Elasticsearch. This way, first load takes some time, then you can just cron it to keep your Elasticsearch instance up to date.

The overall logic is articulated around 3 stages:

- Identify sources (GitHub repositories and/or Jira Projects) to load data from
- [OPTIONAL] Select which sources to load data from by editing `~/.config/zindexer/sources.yml`
- Load data from the selected repositories (for example `zindxer gIssues` to load GitHub issues)

You can then re-run the scripts at regular interval to fetch the updated nodes.

Note: GitHub doesn't provide a mechanism to fetch new or updated labels so the script will (flush the index and) load all labels every time `gLabels` is executed.

# Quick start with Docker

The easiest way to get started quickly is to use docker. In this quick start example we will also run elasticsearch and kibana within a docker image. This example is meant at getting started quickly and should not be used "as-is" for production.

## Set-up Elasticsearch and Kibana

Pull and run an Elasticsearch instance

```sh-session
> docker pull docker.elastic.co/elasticsearch/elasticsearch:7.5.0
> docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.5.0
```

Verify you instance is running properly by opening up a web browser and visiting `http://127.0.0.1:9200`, you should see a JSON payload.

Get the container id of the Elasticsearch instance (for Kibana)

```sh-session
> docker ps
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED             STATUS              PORTS                                            NAMES
f0b5b04a2c24        docker.elastic.co/elasticsearch/elasticsearch:7.5.0   "/usr/local/bin/dock…"   3 minutes ago       Up 3 minutes        0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   hungry_gagarin
```

In this example, the container ID for our Elasticsearch instance is: `f0b5b04a2c24`, we'll use this number to attach the kibana to.

Pull and run a Kibana instance (note the use of the container ID `f0b5b04a2c24`)

```sh-session
> docker pull docker.elastic.co/kibana/kibana:7.5.0
> docker run --link f0b5b04a2c24:elasticsearch -p 5601:5601 docker.elastic.co/kibana/kibana:7.5.0
```

At this point, you should have a Kibana instance running, open-up your web browser and visit `http://127.0.0.1:5601`, click on `Management` on the left side, then `Index Management`. You should see "No Indices to show" since we haven't loaded any data yet.

## Pull and run zindexer

Next, pull the latest version of zindexer

```sh-session
> docker pull zencrepes/zindexer:latest
```

And finally open-up a shell in the container

```sh-session
> docker run -it --rm zencrepes/zindexer:latest /bin/ash
```

Before you use zindexer you will need to configure it. If you start zindexer without a configuration file, it will automatically generate a template, tell you where to find it and exit without running the command

From within the container

```sh-session
> zindexer gIssues
Initialized configuration file with defaults in: /Users/fgerthoffert/.config/zindexer/config.yml
Please EDIT the configuration file first
```

Refer to the following sections to understand how to configure and use the tool.

# Configuration

The configuration file is a yaml file, it can be provided as part of the container (or by mounting a folder containing the configuration into ~/.config/zindexer/) or passed (as a whole) as an environment variable.

If you are just starting and are running a default Elasticsearch instance as detailed above, you only need to configure github, circleci and/or jira credentials. All the other parameters should be good enough with default values.

```yaml
elasticsearch:
  host: 'http://127.0.0.1:9200'
  sslCa: ''
  cloudId: ''
  username: ''
  password: ''
  sysIndices:
    sources: sources
    types: types
  dataIndices:
    githubRepos: gh_repos
    githubIssues: gh_issues_
    githubPullrequests: gh_prs_
    githubProjects: gh_projects_
    githubMilestones: gh_milestones_
    githubLabels: gh_labels_
    githubReleases: gh_releases_
    jiraIssues: j_issues_
    jiraProjects: j_projects_
    circleciPipelines: cci_pipelines_
    circleciEnvvars: cci_envvars_
    circleciInsightsWorkflowsSummary: cci_insights_wfsum_
    circleciInsightsWorkflowsRuns: cci_insights_wfruns_
    circleciInsightsJobsSummary: cci_insights_jobssum_
    circleciInsightsJobsRuns: cci_insights_jobsruns_
github:
  enabled: true
  username: YOUR_USERNAME
  token: YOUR_TOKEN
  fetch:
    maxNodes: 30
circleci:
  enabled: true
  token: YOUR_TOKEN
jira:
  - name: JAHIA
    enabled: true
    config:
      username: YOUR_USERNAME
      password: YOUR_PASSWORD
      host: 'https://jira.mydomain.com'
      fields:
        points: customfield_10114
        originalPoints: customfield_11115
        parentInitiative: customfield_11112
        parentEpic: customfield_10314
      excludeDays:
        - '1900-01-01'
      fetch:
        maxNodes: 30
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
