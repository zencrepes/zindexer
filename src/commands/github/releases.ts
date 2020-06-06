import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import esGithubLatest from '../../utils/es/esGithubLatest';
import chunkArray from '../../utils/misc/chunkArray';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import fetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import { getId } from '../../utils/misc/getId';

import {
  esMapping,
  esSettings,
  fetchNodes,
  zConfig,
  ingestNodes,
  fetchReposWithData,
} from '../../components/githubReleases';

import {
  getEsIndex,
  checkEsIndex,
  pushEsNodes,
  aliasEsIndex,
} from '../../components/esUtils/index';

import pushConfig from '../../utils/zencrepes/pushConfig';

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
    const { flags } = this.parse(Releases);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubPullrequests,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesUpdated(
      gClient,
      fetchNodes,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    const fetchRepos = new fetchNodesByIds(
      this.log,
      userConfig.github.fetch.maxNodes,
      cli,
      fetchReposWithData,
      gClient,
    );

    // Since not all repositories have data, we start by a query giving us a list of all repositories with data
    cli.action.start('Searching for repos with data');
    const ghPayloadChunked = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    let reposData: Array<any> = [];
    for (const reposChunk of ghPayloadChunked) {
      const newRepos = await fetchRepos.load(reposChunk);
      reposData = [...reposData, ...newRepos];
    }

    const reposWithData = reposData
      .filter((r: any) => r.releases.totalCount > 0)
      .map((r: any) => r.id);
    cli.action.stop(' done');

    const sourcesWithData = sources.filter(s => reposWithData.includes(s.id));
    console.log(
      'Found: ' +
        reposWithData.length +
        ' repos with Releases, fetching corresponding data',
    );

    for (const currentSource of sourcesWithData) {
      let releasesIndex = userConfig.elasticsearch.dataIndices.githubReleases;

      this.log('Processing source: ' + currentSource.name);
      const recentRelease = await esGithubLatest(
        eClient,
        releasesIndex,
        currentSource.id,
      );
      cli.action.start(
        'Grabbing releases for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedReleases = await fetchData.load(
        currentSource.id,
        recentRelease,
      );
      cli.action.stop(' done');

      const currentRepository =
        currentSource.repository !== undefined
          ? currentSource.repository
          : null;

      fetchedReleases = ingestNodes(
        fetchedReleases,
        'zindexer',
        currentSource.id,
        currentRepository,
      );

      releasesIndex = getEsIndex(
        userConfig.elasticsearch.dataIndices.githubReleases,
        userConfig.elasticsearch.oneIndexPerSource,
        currentSource.name,
      );

      await checkEsIndex(
        eClient,
        releasesIndex,
        esMapping,
        esSettings,
        this.log,
      );
      await pushEsNodes(eClient, releasesIndex, fetchedReleases, this.log);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        releasesIndex = (
          userConfig.elasticsearch.dataIndices.githubReleases +
          getId(currentSource.name)
        ).toLocaleLowerCase();
      }
    }
    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      // Create an alias used for group querying
      await aliasEsIndex(
        eClient,
        userConfig.elasticsearch.dataIndices.githubMilestones,
        this.log,
      );
    }
  }
}
