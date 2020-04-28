import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import esGithubLatest from '../../utils/es/esGithubLatest';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import { getId } from '../../utils/misc/getId';
import esCheckIndex from '../../utils/es/esCheckIndex';

import fetchGql from '../../utils/github/releases/fetchGql';
import esMapping from '../../utils/github/releases/esMapping';

export default class Releases extends Command {
  static description = 'Github: Fetches releases data from configured sources';

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

    const fetchData = new fetchNodesUpdated(
      gClient,
      fetchGql,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      let releasesIndex = userConfig.elasticsearch.dataIndices.githubReleases;

      this.log('Processing source: ' + currenSource.name);
      const recentRelease = await esGithubLatest(
        eClient,
        releasesIndex,
        currenSource.id,
      );
      cli.action.start(
        'Grabbing releases for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      let fetchedReleases = await fetchData.load(
        currenSource.id,
        recentRelease,
      );
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedReleases = fetchedReleases.map((item: any) => {
        return {
          ...item,
          // eslint-disable-next-line @typescript-eslint/camelcase
          zindexer_sourceid: currenSource.id,
        };
      });

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        releasesIndex = (
          userConfig.elasticsearch.dataIndices.githubReleases +
          getId(currenSource.name)
        ).toLocaleLowerCase();
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, releasesIndex, esMapping);

      await esPushNodes(fetchedReleases, releasesIndex, eClient);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // Create an alias used for group querying
        cli.action.start(
          'Creating the Elasticsearch index alias: ' +
            userConfig.elasticsearch.dataIndices.githubReleases,
        );
        await eClient.indices.putAlias({
          index: userConfig.elasticsearch.dataIndices.githubReleases + '*',
          name: userConfig.elasticsearch.dataIndices.githubReleases,
        });
        cli.action.stop(' done');
      }
    }
  }
}
