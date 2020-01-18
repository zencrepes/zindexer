import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';
import esClient from '../utils/es/esClient';
import esGithubLatest from '../utils/es/esGithubLatest';
import esPushNodes from '../utils/es/esPushNodes';
import fetchNodesUpdated from '../utils/github/fetchNodesUpdated';
import ghClient from '../utils/github/ghClient';

import esGetActiveSources from '../utils/es/esGetActiveSources';
import { getId } from '../utils/misc/getId';
import esCheckIndex from '../utils/es/esCheckIndex';
import ymlMappingsGReleases from '../schemas/gReleases';

import getReleases from '../utils/github/graphql/getReleases';

export default class GReleases extends Command {
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
      getReleases,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      const releasesIndex = (
        userConfig.elasticsearch.dataIndices.githubReleases +
        getId(currenSource.name)
      ).toLocaleLowerCase();
      this.log('Processing source: ' + currenSource.name);
      const recentRelease = await esGithubLatest(eClient, releasesIndex);
      cli.action.start(
        'Grabbing releases for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      const fetchedReleases = await fetchData.load(
        currenSource.id,
        recentRelease,
      );
      cli.action.stop(' done');

      // Check if index exists, create it if it does not
      await esCheckIndex(
        eClient,
        userConfig,
        releasesIndex,
        ymlMappingsGReleases,
      );

      await esPushNodes(fetchedReleases, releasesIndex, eClient);

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
