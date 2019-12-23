import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';

import esClient from '../utils/es/esClient';
import esGithubLatest from '../utils/es/esGithubLatest';
import fetchPullrequests from '../utils/github/fetchPullrequests';
import ghClient from '../utils/github/ghClient';

import esGetActiveSources from '../utils/es/esGetActiveSources';
import { getId } from '../utils/misc/getId';

import chunkArray from '../utils/misc/chunkArray';

import { GithubPullrequest } from '../global';

export default class GPullrequests extends Command {
  static description =
    'Github: Fetches PullRequests data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchPullrequests(
      gClient,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      const issuesIndex = (
        userConfig.elasticsearch.indices.githubPullrequests +
        getId(currenSource.name)
      ).toLocaleLowerCase();
      const recentPullrequest = await esGithubLatest(eClient, issuesIndex);

      cli.action.start(
        'Grabbing issues for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      const fetchedPullrequests = await fetchData.load(
        currenSource.id,
        recentPullrequest,
      );
      cli.action.stop(' done');

      // Split the payload into multiple batches before pushing to elasticsearch

      const esPayloadChunked = await chunkArray(fetchedPullrequests, 100);
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
                _id: (rec as GithubPullrequest).id,
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
