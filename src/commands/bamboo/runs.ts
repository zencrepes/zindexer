import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';

import {
  ESIndexSources,
  ConfigBamboo,
} from '../../global';

import {
  esMapping,
  esSettings,
  zConfig,
  ingestNodes,
  RunNode,
} from '../../components/bambooRuns';

import {
  checkEsIndex,
} from '../../components/esUtils/index';
import esGetActiveSources from '../../utils/es/esGetActiveSources';

import fetchRunsPagination from '../../utils/bamboo/utils/fetchRuns/index';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class States extends Command {
  static description = 'States: Initialize ES indeices for Testing States';

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
    all: flags.boolean({
      char: 'a',
      default: false,
      description: 'Delete all issues from Elasticsearch and fetch all again',
    }),
    plan: flags.string({
      char: 'p',
      description: 'Fetch issues for a particular plan key',
    }),    
  };

  async run() {
    const { flags } = this.parse(States);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.bambooRuns,
      flags.reset,
    );

    await checkEsIndex(eClient, userConfig.elasticsearch.dataIndices.bambooRuns, esMapping, esSettings, this.log);


    if (flags.config === true) {
      return;
    }

    // Split the array by bamboo server
    for (const bambooServer of userConfig.bamboo.filter(
      (p: ConfigBamboo) => p.enabled === true,
    )) {
      const sources = await esGetActiveSources(eClient, userConfig, 'BAMBOO');
      if (sources.length === 0) {
        this.error(
          'The script could not find any active sources. Please configure sources first.',
          { exit: 1 },
        );
      }
      for (const source of sources
        .filter((s: ESIndexSources) => s.server === bambooServer.name)
        .filter(
          (s: ESIndexSources) =>
            flags.plan === undefined || flags.plan === s.plan,
        )) {

        let existingRuns: Array<number> = [];
        if (flags.all === true) {
          // If refresh flag is true, delete all runs and refetch
          cli.action.start('Deleting all runs for plan: ' + source.name);
          await eClient.deleteByQuery({
            index: userConfig.elasticsearch.dataIndices.bambooRuns,
            body: {
              query: {
                match: {
                  zindexerSourceId: {
                    query: source.id,
                  },
                },
              },
            },
          });
          cli.action.stop();
        } else {
          //B - Fetch all run numbers for that particular plan
          const scrollSearch = eClient.helpers.scrollSearch({
            index: userConfig.elasticsearch.dataIndices.bambooRuns,
            body: {
              _source: 'number',
              query: {
                match: {
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  zindexerSourceId: {
                    query: source.id,
                  },
                },
              },
            },
          });
          for await (const result of scrollSearch) {
            existingRuns = [...existingRuns, ...result.documents.map((d: any) => d.number)];
          }
        }

        cli.action.start('Fetching runs for project: ' + source.name);
        const fetchedRuns = await fetchRunsPagination(
          userConfig,
          source.server,
          source.plan,
          existingRuns,
        );
        cli.action.stop(' done');

        const preppedNodes = ingestNodes(
          fetchedRuns,
          source,
          'zindexer',
        );

        //Break down the issues response in multiple batches
        const esPayloadChunked = await chunkArray(preppedNodes, 100);
        //Push the results back to Elastic Search
        for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
          cli.action.start(
            'Submitting data to ElasticSearch into ' +
              userConfig.elasticsearch.dataIndices.bambooRuns +
              ' (' +
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
                  _index: userConfig.elasticsearch.dataIndices.bambooRuns,
                  _id: (rec as RunNode).id,
                },
              }) +
              '\n' +
              JSON.stringify(rec) +
              '\n';
          }
          await eClient.bulk({
            index: userConfig.elasticsearch.dataIndices.bambooRuns,
            refresh: 'wait_for',
            body: formattedData,
          });
          cli.action.stop(' done');
        }

      //}
    }
  }    
  }
}
