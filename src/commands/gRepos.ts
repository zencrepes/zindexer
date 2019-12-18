import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as jsYaml from 'js-yaml';

import Command from '../base';
import esClient from '../utils/es/esClient';
import { GithubRepository } from '../global';
import esGetActiveSources from '../utils/es/esGetActiveSources';

import YmlRepos from '../schemas/githubRepos';

import YmlSettings from '../schemas/settings';

import getReposById from '../utils/github/graphql/getReposById';

import chunkArray from '../utils/misc/chunkArray';
import GetNodesById from '../utils/github/getNodesById';

export default class GRepos extends Command {
  static description = 'Github: Fetches repos data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;
    const client = await esClient(userConfig.elasticsearch);

    const sources = await esGetActiveSources(client, userConfig, 'GITHUB');
    const githubChunks = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    const fetchData = new GetNodesById(
      this.log,
      userConfig.github.token,
      userConfig.github.fetch.maxNodes,
      cli,
      getReposById,
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

    const esIndex = userConfig.elasticsearch.indices.githubRepos;
    const testIndex = await client.indices.exists({ index: esIndex });
    if (testIndex.body === false) {
      cli.action.start(
        'Elasticsearch Index ' + esIndex + ' does not exist, creating',
      );
      const mappings = await jsYaml.safeLoad(YmlRepos);
      const settings = await jsYaml.safeLoad(YmlSettings);
      await client.indices.create({
        index: esIndex,
        body: { settings, mappings },
      });
      cli.action.stop(' created');
    }

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
              _id: (rec as GithubRepository).id,
            },
          }) +
          '\n' +
          JSON.stringify(rec) +
          '\n';
      }
      await client.bulk({
        index: esIndex,
        refresh: 'wait_for',
        body: formattedData,
      });
      cli.action.stop(' done');
    }
  }
}
