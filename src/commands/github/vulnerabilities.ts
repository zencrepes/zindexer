import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';

import esGithubLatest from '../../utils/es/esGithubLatest';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
import fetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';

import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import esCheckIndex from '../../utils/es/esCheckIndex';

import { getId } from '../../utils/misc/getId';

import esMapping from '../../utils/github/vulnerabilities/esMapping';
import fetchGql from '../../utils/github/vulnerabilities/fetchGql';
import fetchReposWithData from '../../utils/github/vulnerabilities/fetchReposWithData';

import esMappingConfig from '../../utils/mappings/config';
import zConfig from '../../utils/github/vulnerabilities/zConfig';

import { differenceInDays } from 'date-fns';
import fetchConfig from '../../utils/zencrepes/fetchConfig';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Vulnerabilities extends Command {
  static description =
    'Github: Fetches Vulnerabilities data from configured sources';

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

    const fetchData = new fetchNodesByQuery(
      gClient,
      fetchGql,
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

    // Since not all repositories have data, we start by a query giving us a list of all repositories with vulnerabilities\
    cli.action.start('Searching for repos with vulnerabilities');
    const ghPayloadChunked = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    let reposData: Array<any> = [];
    for (const reposChunk of ghPayloadChunked) {
      const newRepos = await fetchRepos.load(reposChunk);
      reposData = [...reposData, ...newRepos];
    }
    const reposWithVulnerabilities = reposData
      .filter((r: any) => r.vulnerabilityAlerts.totalCount > 0)
      .map((r: any) => r.id);
    cli.action.stop(' done');

    const sourcesWithVulnerabilities = sources.filter(s =>
      reposWithVulnerabilities.includes(s.id),
    );
    console.log(
      'Found: ' +
        sourcesWithVulnerabilities.length +
        ' repos with Vulnerabilities, fetching corresponding data',
    );

    for (const currentSource of sourcesWithVulnerabilities) {
      let vulnerabilitiesIndex =
        userConfig.elasticsearch.dataIndices.githubVulnerabilities;

      this.log('Processing source: ' + currentSource.name);
      cli.action.start(
        'Grabbing vulnerabilities for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedVulnerabilities = await fetchData.load({
        repoId: currentSource.id,
      });
      cli.action.stop(' done');

      // Some data manipulation on all items
      fetchedVulnerabilities = fetchedVulnerabilities.map((item: any) => {
        let dismissedAfter = null;
        if (item.dismissedAt !== null) {
          dismissedAfter = differenceInDays(
            new Date(item.dismissedAt),
            new Date(item.createdAt),
          );
        }
        return {
          ...item,
          zindexer_sourceid: currentSource.id,
          dismissedAfter: dismissedAfter,
        };
      });

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        vulnerabilitiesIndex = (
          userConfig.elasticsearch.dataIndices.githubVulnerabilities +
          getId(currentSource.name)
        ).toLocaleLowerCase();
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, vulnerabilitiesIndex, esMapping);

      // Push all nodes to the index
      await esPushNodes(fetchedVulnerabilities, vulnerabilitiesIndex, eClient);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // If one index per source, then an alias is created automatically to all of the indices
        // Create an alias used for group querying
        cli.action.start(
          'Creating the Elasticsearch index alias: ' +
            userConfig.elasticsearch.dataIndices.githubVulnerabilities,
        );
        await eClient.indices.putAlias({
          index:
            userConfig.elasticsearch.dataIndices.githubVulnerabilities + '*',
          name: userConfig.elasticsearch.dataIndices.githubVulnerabilities,
        });
        cli.action.stop(' done');
      }
    }

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubVulnerabilities,
    );
  }
}
