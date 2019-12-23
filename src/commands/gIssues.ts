import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';
import esClient from '../utils/es/esClient';
import esGithubLatest from '../utils/es/esGithubLatest';
import fetchIssues from '../utils/github/fetchIssues';
import ghClient from '../utils/github/ghClient';

import esGetActiveSources from '../utils/es/esGetActiveSources';
import { getId } from '../utils/misc/getId';

import chunkArray from '../utils/misc/chunkArray';

import { GithubIssue } from '../global';

export default class GIssues extends Command {
  static description = 'Github: Fetches issues data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchIssues(
      gClient,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      const issuesIndex = (
        userConfig.elasticsearch.indices.githubIssues + getId(currenSource.name)
      ).toLocaleLowerCase();
      const recentIssue = await esGithubLatest(eClient, issuesIndex);

      cli.action.start(
        'Grabbing issues for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      const fetchedIssues = await fetchData.load(currenSource.id, recentIssue);
      cli.action.stop(' done');

      // Split the payload into multiple batches before pushing to elasticsearch

      const esPayloadChunked = await chunkArray(fetchedIssues, 100);
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
                _index: issuesIndex,
                _id: (rec as GithubIssue).id,
              },
            }) +
            '\n' +
            JSON.stringify(rec) +
            '\n';
        }
        await eClient.bulk({
          index: issuesIndex,
          refresh: 'wait_for',
          body: formattedData,
        });
        cli.action.stop(' done');
      }
    }
  }
}
