import { flags } from '@oclif/command';
import Command from '../base';
import cli from 'cli-ux';
import { ApiResponse } from '@elastic/elasticsearch';
import * as _ from 'lodash';
import getUuid from 'uuid-by-string';
import * as fs from 'fs';
import * as path from 'path';
import * as jsYaml from 'js-yaml';
import * as loadYamlFile from 'load-yaml-file';

import {
  JiraResponseProject,
  ESSearchResponse,
  ESIndexSources,
  GithubRepository,
  GithubOrganization,
} from '../global';

import fetchProjects from '../utils/jira/utils/fetchProjects/index';
import ymlMappingsSources from '../utils/mappings/sources';
import esCheckIndex from '../utils/es/esCheckIndex';
import esClient from '../utils/es/esClient';
import ghClient from '../utils/github/utils/ghClient';

import graphqlQuery from '../utils/github/utils/graphqlQuery';

import getOrgs from '../utils/github/graphql/getOrgs';
import getOrgRepos from '../utils/github/graphql/getOrgRepos';
import getOrgByName from '../utils/github/graphql/getOrgByName';
import getRepoByName from '../utils/github/graphql/getRepoByName';
import getUserByLogin from '../utils/github/graphql/getUserByLogin';
import getUserRepos from '../utils/github/graphql/getUserRepos';
import fetchNodesByQuery from '../utils/github/utils/fetchNodesByQuery';

import esQueryData from '../utils/es/esQueryData';

import chunkArray from '../utils/misc/chunkArray';

export default class Sources extends Command {
  static description = 'Manage data sources (GitHub or Jira)';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    // flag with a value (-n, --name=VALUE)
    type: flags.string({
      char: 't',
      options: ['JIRA', 'GITHUB'],
      required: false,
      default: 'GITHUB',
      description: 'Type of source (JIRA or GitHUB)',
    }),
    active: flags.boolean({
      char: 'a',
      default: false,
      description: 'Automatically make the new sources active by default',
    }),
    load: flags.boolean({
      char: 'l',
      default: false,
      description:
        'Load active status from status file: CONFIG_DIR/sources.yml',
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
    const { type, active, ggrab, gorg, grepo, load } = flags;

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    let dataSources: Array<ESIndexSources> = [];
    let esPayload: Array<ESIndexSources> = [];
    // 1- Grab data sources from either GitHub or Jira
    if (load === true) {
      dataSources = await esQueryData(
        eClient,
        userConfig.elasticsearch.sysIndices.sources,
        {
          from: 0,
          size: 10000,
          query: {
            match_all: {}, // eslint-disable-line
          },
        },
      );

      //Math the data with the config file
      cli.action.start(
        'Grabbing sources configuration from file: ' +
          path.join(this.config.configDir, 'sources.yml'),
      );
      let sourcesConfig: Array<object> = [];
      if (fs.existsSync(path.join(this.config.configDir, 'sources.yml'))) {
        sourcesConfig = await loadYamlFile(
          path.join(this.config.configDir, 'sources.yml'),
        );
      } else {
        this.error(
          'Unable to find the repositories config file (' +
            path.join(this.config.configDir, 'sources.yml') +
            '), please run ghRepos first',
          { exit: 1 },
        );
      }
      cli.action.stop(' done');

      cli.action.start(
        'Comparing Elasticsearch data with flags in configuration file',
      );
      esPayload = dataSources.map(source => {
        const cfgSource = _.find(
          sourcesConfig,
          (o: object) =>
            // eslint-disable-next-line
            (o as any)['JIRA/' + source.name] !== undefined ||
            // eslint-disable-next-line
            (o as any)['GITHUB/' + source.name] !== undefined,
        );
        if (cfgSource !== undefined) {
          if (Object.values(cfgSource)[0] !== source.active) {
            this.log(
              'Changing: ' +
                source.name +
                ' from: ' +
                source.active +
                ' to: ' +
                Object.values(cfgSource)[0],
            );
          }
          return {
            ...source,
            active: Object.values(cfgSource)[0],
          };
        } else {
          return source;
        }
      });
      cli.action.stop(' done');
    } else {
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
                project: p.key,
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
          // Fetch repositories directly attached to the user
          const userResponse = await graphqlQuery(
            gClient,
            getUserByLogin,
            { userLogin: userConfig.github.username },
            {
              limit: 5000,
              cost: 1,
              remaining: 5000,
              resetAt: null,
            },
            this.log,
          );
          if (userResponse.data.user !== null) {
            const fetchReposData = new fetchNodesByQuery(
              gClient,
              getUserRepos,
              this.log,
              userConfig.github.fetch.maxNodes,
              this.config.configDir,
            );
            cli.action.start(
              'Fetching repositories for user: ' + userResponse.data.user.login,
            );
            const fetched = await fetchReposData.load({
              userId: userResponse.data.user.id,
            });
            fetchedRepos = [...fetchedRepos, ...fetched];
            cli.action.stop(' done');
          }

          // Fetch affiliated organizations
          const fetchOrgsData = new fetchNodesByQuery(
            gClient,
            getOrgs,
            this.log,
            userConfig.github.fetch.maxNodes,
            this.config.configDir,
          );
          const orgs: Array<GithubOrganization> = await fetchOrgsData.load({});

          const fetchReposData = new fetchNodesByQuery(
            gClient,
            getOrgRepos,
            this.log,
            userConfig.github.fetch.maxNodes,
            this.config.configDir,
          );
          for (const currentOrg of orgs) {
            cli.action.start(
              'Fetching repositories for org: ' + currentOrg.login,
            );
            const fetched = await fetchReposData.load({
              orgId: currentOrg.id,
            });
            fetchedRepos = [...fetchedRepos, ...fetched];
            cli.action.stop(' done');
          }
        } else if (ggrab === 'org' && gorg !== undefined) {
          this.log('Starting to fetch data from org: ' + gorg);
          // 1- Check if org actually exists
          const orgResponse = await graphqlQuery(
            gClient,
            getOrgByName,
            { orgName: gorg }, // eslint-disable-line
            {
              limit: 5000,
              cost: 1,
              remaining: 5000,
              resetAt: null,
            },
            this.log,
          );
          if (orgResponse.data.organization !== null) {
            const fetchReposData = new fetchNodesByQuery(
              gClient,
              getOrgRepos,
              this.log,
              userConfig.github.fetch.maxNodes,
              this.config.configDir,
            );
            cli.action.start(
              'Fetching repositories for org: ' +
                orgResponse.data.organization.login,
            );
            const fetched = await fetchReposData.load({
              orgId: orgResponse.data.organization.id,
            });
            fetchedRepos = [...fetchedRepos, ...fetched];
            cli.action.stop(' done');
          } else {
            console.error('ERROR: Unable to find an org with name: ' + gorg);
          }
        } else if (
          ggrab === 'repo' &&
          gorg !== undefined &&
          grepo !== undefined
        ) {
          this.log('Starting to fetch data from repo: ' + gorg + '/' + grepo);
          const repoResponse = await graphqlQuery(
            gClient,
            getRepoByName,
            { orgName: gorg, repoName: grepo }, // eslint-disable-line
            {
              limit: 5000,
              cost: 1,
              remaining: 5000,
              resetAt: null,
            },
            this.log,
          );
          if (repoResponse.data.repository !== null) {
            fetchedRepos = [repoResponse.data.repository];
          } else {
            console.error(
              'ERROR: Unable to find this repository: ' + gorg + '/' + grepo,
            );
          }
        }
        dataSources = [
          ...dataSources,
          ...fetchedRepos.map((p: GithubRepository) => {
            return {
              uuid: getUuid('GITHUB-' + p.id, 5),
              id: p.id,
              type: 'GITHUB',
              name: p.owner.login + '/' + p.name,
              repository: {
                name: p.name,
                id: p.id,
                url: p.url,
                owner: p.owner,
              },
              active: active,
            };
          }),
        ];
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(
        eClient,
        userConfig,
        userConfig.elasticsearch.sysIndices.sources,
        ymlMappingsSources,
      );

      cli.action.start(
        'Grabbing data from ElasticSearch and merging with new data',
      );

      const esRepos: ApiResponse<ESSearchResponse<
        ESIndexSources
      >> = await eClient.search({
        index: userConfig.elasticsearch.sysIndices.sources,
        body: {
          from: 0,
          size: 10000,
          query: {
            match_all: {}, // eslint-disable-line
          },
        },
      });

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
    }

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
              _index: userConfig.elasticsearch.sysIndices.sources,
              _id: (rec as ESIndexSources).uuid,
            },
          }) +
          '\n' +
          JSON.stringify(rec) +
          '\n';
      }
      await eClient.bulk({
        index: userConfig.elasticsearch.sysIndices.sources,
        refresh: 'wait_for',
        body: formattedData,
      });
      cli.action.stop(' done');
    }

    //Update the configuration by re-downloading all data from ElasticSearch to create the configuration file
    cli.action.start('Refreshing the repositories configuration file');
    const esSources = await eClient.search({
      index: userConfig.elasticsearch.sysIndices.sources,
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
