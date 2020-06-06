import { flags } from '@oclif/command';

import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import { getId } from '../../utils/misc/getId';

import esGetActiveSources from '../../utils/es/esGetActiveSources';

import esMapping from '../../utils/circleci/envvars/esMapping';
import zConfig from '../../utils/circleci/envvars/zConfig';

import esCheckIndex from '../../utils/es/esCheckIndex';
import esPushNodes from '../../utils/es/esPushNodes';

import fetchData from '../../utils/circleci/utils/fetchData';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Envvars extends Command {
  static description = 'Fetches Environment variables from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    config: flags.boolean({
      char: 'c',
      default: false,
      description: 'Only update ZenCrepes configuration',
    }),
    reset: flags.boolean({
      char: 'r',
      default: false,
      description: 'Reset ZenCrepes configuration to default',
    }),
  };

  async run() {
    const { flags } = this.parse(Envvars);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // eslint-disable-next-line
    const cryptoRandomString = require('crypto-random-string');

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.circleciEnvvars,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    // For each new value returned by CCI API, an random string is generated and stored in an array
    // This allow users to identify if same value are present across multiple sources but does not reveal anything
    // about the value itself.
    const obfuscatedPass: Array<{
      value: string;
      random: string;
    }> = [];

    // Get active sources from Github only
    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');
    if (sources.length === 0) {
      this.error(
        'The script could not find any active sources. Please configure sources first.',
        { exit: 1 },
      );
    }
    for (const currentSource of sources) {
      console.log('Processing envvards for source: ' + currentSource.name);

      const fetchedItems = await fetchData(
        'project/gh/' + currentSource.name + '/envvar',
        userConfig.circleci.token,
        [],
      );

      // Before pushing nodes to ES
      // eslint-disable-next-line
      const items = fetchedItems.map((item: any) => {
        let randomValue = cryptoRandomString({ length: 10 });
        const existObfuscated = obfuscatedPass.find(
          (p: { value: string; random: string }) => p.value === item.value,
        );
        if (existObfuscated === undefined) {
          obfuscatedPass.push({
            random: randomValue,
            value: item.value,
          });
        } else {
          randomValue = existObfuscated.random;
        }
        return {
          ...item,
          source: currentSource,
          value: 'OBFUSCATED:' + randomValue,
          id: currentSource.uuid + '-' + item.name,
          url:
            'https://app.circleci.com/settings/project/github/' +
            currentSource.name +
            '/environment-variables',
        };
      });

      let envvarIndex = userConfig.elasticsearch.dataIndices.circleciEnvvars;
      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        envvarIndex = (
          userConfig.elasticsearch.dataIndices.circleciEnvvars +
          getId(currentSource.name)
        ).toLocaleLowerCase();
      }

      if (items.length > 0) {
        // Check if index exists, create it if it does not
        await esCheckIndex(eClient, userConfig, envvarIndex, esMapping);
        await esPushNodes(items, envvarIndex, eClient);
      }
    }
    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      // Create an alias used for group querying
      cli.action.start(
        'Creating the Elasticsearch index alias: ' +
          userConfig.elasticsearch.dataIndices.circleciEnvvars,
      );
      await eClient.indices.putAlias({
        index: userConfig.elasticsearch.dataIndices.circleciEnvvars + '*',
        name: userConfig.elasticsearch.dataIndices.circleciEnvvars,
      });
      cli.action.stop(' done');
    }
  }
}
