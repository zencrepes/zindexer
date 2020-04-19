import { flags } from '@oclif/command';
import Command from '../base';
import cli from 'cli-ux';
import { ApiResponse } from '@elastic/elasticsearch';
import * as _ from 'lodash';
import * as getUuid from 'uuid-by-string';
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
import syncDatasets from '../utils/misc/syncDatasets';
import fetchConfig from '../utils/zencrepes/fetchConfig';

import esPushNodes from '../utils/es/esPushNodes';

export default class Sources extends Command {
  static description = 'Manage Zencrepes (UI) configuration';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    save: flags.boolean({
      char: 's',
      default: false,
      description: 'Save configuration to file: CONFIG_DIR/zencrepes.yml',
    }),
    load: flags.boolean({
      char: 'l',
      default: false,
      description: 'Load configuration from file: CONFIG_DIR/zencrepes.yml',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Sources);
    const { load, save } = flags;

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const zencrepesConfigFile = path.join(
      this.config.configDir,
      'zencrepes.yml',
    );

    cli.action.start('Fetching datasets configuration from Elasticsearch');
    const currentConfig = await fetchConfig(eClient, userConfig);

    if (save === true) {
      cli.action.start('Saving Zencrepes configuration file');
      fs.writeFileSync(zencrepesConfigFile, jsYaml.safeDump(currentConfig));
      cli.action.stop(' done');
    } else if (load === true) {
      cli.action.start(
        'Grabbing ZenCrepes configuration from file: ' + zencrepesConfigFile,
      );
      let sourcesConfig: Array<object> = [];
      if (fs.existsSync(zencrepesConfigFile)) {
        sourcesConfig = await loadYamlFile(zencrepesConfigFile);
      } else {
        this.error(
          'Unable to find the config file (' +
            zencrepesConfigFile +
            '), please save it first (using the -s flag)',
          { exit: 1 },
        );
      }
      cli.action.stop(' done');

      if (sourcesConfig.length > 0) {
        cli.action.start('Pushing new config to Elasticsearch');
        await esPushNodes(
          sourcesConfig,
          userConfig.elasticsearch.sysIndices.config,
          eClient,
        );
        cli.action.stop(' done');
      } else {
        console.log('No configuration found in file');
      }
    }
  }
}
