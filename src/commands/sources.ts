import { flags } from '@oclif/command';
import Command from '../base';
import cli from 'cli-ux';
import { ApiResponse } from '@elastic/elasticsearch';
import * as _ from 'lodash';
import * as getUuid from 'uuid-by-string';
import * as fs from 'fs';
import * as path from 'path';
import * as jsYaml from 'js-yaml';

import {
  JiraResponseProject,
  ESSearchResponse,
  ESIndexSources,
  GithubRepository,
} from '../global';

import FetchAffiliated from '../utils/github/fetchAffiliated/index';
import fetchProjects from '../utils/jira/fetchProjects/index';
import FetchOrg from '../utils/github/fetchOrg/index';
import FetchRepo from '../utils/github/fetchRepo/index';
import ymlMappingsSources from '../schemas/sources';
import esCheckIndex from '../utils/es/esCheckIndex';
import esClient from '../utils/es/esClient';

import chunkArray from '../utils/misc/chunkArray';

export default class Sources extends Command {
  static description = 'Manage sources of data';

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    type: flags.string({
      char: 't',
      options: ['JIRA', 'GITHUB'],
      required: true,
      description: 'Type of source (JIRA or GitHUB)',
    }),
    active: flags.boolean({
      char: 'a',
      default: false,
      description: 'Automatically make the new sources active by default',
    }),
    ggrab: flags.string({
      char: 'g',
      default: 'affiliated',
      options: ['affiliated', 'org', 'repo'],
      description: 'If Github, Select how to fetch repositories',
    }),
    gorg: flags.string({
      char: 'o',
      required: false,
      description: 'If Github, organization login',
    }),
    grepo: flags.string({
      char: 'r',
      required: false,
      description: 'If Github, repository name',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Sources);
    const { type, active, ggrab, gorg, grepo } = flags;

    const userConfig = this.userConfig;

    let dataSources: Array<ESIndexSources> = [];
    // 1- Grab data sources from either GitHub or Jira
    if (type === 'JIRA') {
      this.log('Fetching data from server: About to fetch sources from JIRA');
      //console.log(await fetchProjects(userConfig, 'JIRA-JAHIA'));
      for (const jiraServer of userConfig.jira) {
        cli.action.start('Fetching data from server: ' + jiraServer.name);
        const jiraProjects = await fetchProjects(userConfig, jiraServer.name);
        dataSources = [
          ...dataSources,
          ...jiraProjects.map((p: JiraResponseProject) => {
            return {
              uuid: getUuid('JIRA-' + p.key + '-' + p.name, 'SOURCES', 5),
              id: p.key,
              type: 'JIRA',
              server: jiraServer.name,
              name: p.name + '-' + p.key,
              active: active,
            };
          }),
        ];
        cli.action.stop(' done');
      }
    } else {
      let fetchedRepos: Array<any> = []; // eslint-disable-line
      if (ggrab === 'affiliated') {
        this.log('Starting to fetch data from affiliated organizations');
        const fetchData = new FetchAffiliated(
          this.log,
          this.error,
          userConfig.github.username,
          userConfig.github.token,
          userConfig.github.fetch.maxNodes,
          cli,
        );
        fetchedRepos = await fetchData.load();
      } else if (ggrab === 'org' && gorg !== undefined) {
        this.log('Starting to fetch data from org: ' + gorg);
        const fetchData = new FetchOrg(
          this.log,
          userConfig.github.token,
          userConfig.github.fetch.maxNodes,
          cli,
        );
        fetchedRepos = await fetchData.load(gorg);
      } else if (
        ggrab === 'repo' &&
        gorg !== undefined &&
        grepo !== undefined
      ) {
        this.log('Starting to fetch data from repo: ' + gorg + '/' + grepo);
        const fetchData = new FetchRepo(
          this.log,
          userConfig.github.token,
          userConfig.github.fetch.maxNodes,
          cli,
        );
        fetchedRepos = await fetchData.load(gorg, grepo);
      }
      dataSources = [
        ...dataSources,
        ...fetchedRepos.map((p: GithubRepository) => {
          return {
            uuid: getUuid('GITHUB-' + p.id, 5),
            id: p.id,
            type: 'GITHUB',
            name: p.org.login + '/' + p.name,
            active: active,
          };
        }),
      ];
    }

    // Check if index exists, create it if it does not

    const client = await esClient(userConfig.elasticsearch);

    await esCheckIndex(
      client,
      userConfig,
      userConfig.elasticsearch.indices.sources,
      ymlMappingsSources,
    );

    cli.action.start(
      'Grabbing data from ElasticSearch and merging with new data',
    );

    const esRepos: ApiResponse<ESSearchResponse<
      ESIndexSources
    >> = await client.search({
      index: userConfig.elasticsearch.indices.sources,
      body: {
        from: 0,
        size: 10000,
        query: {
          match_all: {}, // eslint-disable-line
        },
      },
    });

    const esPayload: Array<object> = [];
    dataSources.map((source: ESIndexSources) => {
      const existingRepo = _.find(esRepos.body.hits.hits, function(o) {
        return o._source.id === source.id && o._source.name === source.name;
      });
      const updatedRepo = { ...source };
      if (existingRepo !== undefined) {
        //If the repo exist, we are only looking for the active flag
        updatedRepo.active = existingRepo._source.active;
      } else {
        updatedRepo.active = false;
      }
      if (active === true) {
        updatedRepo.active = true;
      }
      //If submitting only one repository, assumption is that it should be active.
      if (ggrab === 'repo') {
        this.log('Activating repository: ' + gorg + '/' + grepo);
        updatedRepo.active = true;
      }
      esPayload.push(updatedRepo);
    });
    cli.action.stop(' done');
    this.log(
      'About to submit (create or update) data about ' +
        esPayload.length +
        ' source(s) to Elasticsearch',
    );

    //Split the array in chunks of 100
    const esPayloadChunked = await chunkArray(esPayload, 100);
    // Push the data back to elasticsearch
    for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
      cli.action.start(
        'Submitting data to ElasticSearch (' +
          (idx + 1) +
          ' / ' +
          esPayloadChunked.length +
          ')',
      );
      let formattedData = '';
      for (const rec of esPayloadChunk) {
        formattedData =
          formattedData +
          JSON.stringify({
            index: {
              _index: userConfig.elasticsearch.indices.sources,
              _id: (rec as ESIndexSources).uuid,
            },
          }) +
          '\n' +
          JSON.stringify(rec) +
          '\n';
      }
      await client.bulk({
        index: userConfig.elasticsearch.indices.sources,
        refresh: 'wait_for',
        body: formattedData,
      });
      cli.action.stop(' done');
    }

    //Update the configuration by re-downloading all data from ElasticSearch to create the configuration file
    cli.action.start('Refreshing the repositories configuration file');
    const esSources = await client.search({
      index: userConfig.elasticsearch.indices.sources,
      body: {
        from: 0,
        size: 10000,
        query: {
          match_all: {}, // eslint-disable-line
        },
      },
    });

    const esResults = _.sortBy(
      esSources.body.hits.hits.map(
        (r: { _source: ESIndexSources }) => r._source,
      ),
      ['type', 'name'],
    );

    this.log('All available sources:');
    cli.table(
      esResults,
      {
        type: {
          get: row => row.type,
        },
        name: {
          get: row => row.name,
        },
        active: {
          get: row => row.active,
        },
      },
      {
        printLine: this.log,
      },
    );
    this.log('');
    const configArray = esResults.map(source => {
      return {
        [source.type + '/' + source.name]: source.active,
      };
    });
    fs.writeFileSync(
      path.join(this.config.configDir, 'sources.yml'),
      jsYaml.safeDump(configArray),
    );
    cli.action.stop(' done');
    this.log(
      'You can enable/disable sources in: ' +
        path.join(this.config.configDir, 'sources.yml'),
    );

    cli.action.stop(' done');
  }
}
