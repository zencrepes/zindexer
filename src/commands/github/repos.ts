import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import ghClient from '../../utils/github/utils/ghClient';
import { GithubRepository } from '../../global';
import esGetActiveSources from '../../utils/es/esGetActiveSources';
import FetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';

import esCheckIndex from '../../utils/es/esCheckIndex';

import ymlEsMapping from '../../utils/github/repos/esMapping';
import fetchGql from '../../utils/github/repos/fetchGql';

import chunkArray from '../../utils/misc/chunkArray';

export default class Repos extends Command {
  static description = 'Github: Fetches repos data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');
    const githubChunks = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    const fetchData = new FetchNodesByIds(
      this.log,
      userConfig.github.fetch.maxNodes,
      cli,
      fetchGql,
      gClient,
    );
    let fetchedRepos: Array<GithubRepository> = [];
    for (const githubChunk of githubChunks) {
      cli.action.start(
        'Loading  ' +
          githubChunk.length +
          ' repos from GitHub (' +
          (fetchedRepos.length + githubChunk.length) +
          ' / ' +
          sources.length +
          ')',
      );
      const updatedData = await fetchData.load(githubChunk);
      fetchedRepos = [...fetchedRepos, ...updatedData];
      cli.action.stop(' done');
    }

    const esIndex = userConfig.elasticsearch.dataIndices.githubRepos;
    // Check if index exists, create it if it does not
    await esCheckIndex(eClient, userConfig, esIndex, ymlEsMapping);

    //Break down the issues response in multiple batches
    const esPayloadChunked = await chunkArray(fetchedRepos, 100);
    //Push the results back to Elastic Search
    for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
      cli.action.start(
        'Submitting data to ElasticSearch into ' +
          esIndex +
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
              _index: esIndex,
              _id: (rec as GithubRepository).nodeId,
            },
          }) +
          '\n' +
          JSON.stringify(rec) +
          '\n';
      }
      await eClient.bulk({
        index: esIndex,
        refresh: 'wait_for',
        body: formattedData,
      });
      cli.action.stop(' done');
    }
  }
}