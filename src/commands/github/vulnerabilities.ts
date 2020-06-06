import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';

import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
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
} from '../../components/githubVulnerabilities';

import {
  getEsIndex,
  checkEsIndex,
  pushEsNodes,
  aliasEsIndex,
} from '../../components/esUtils/index';

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
    const { flags } = this.parse(Vulnerabilities);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubVulnerabilities,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesByQuery(
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

      fetchedVulnerabilities = ingestNodes(
        fetchedVulnerabilities,
        'zindexer',
        currentSource.id,
      );

      vulnerabilitiesIndex = getEsIndex(
        userConfig.elasticsearch.dataIndices.githubVulnerabilities,
        userConfig.elasticsearch.oneIndexPerSource,
        currentSource.name,
      );

      await checkEsIndex(
        eClient,
        vulnerabilitiesIndex,
        esMapping,
        esSettings,
        this.log,
      );
      await pushEsNodes(
        eClient,
        vulnerabilitiesIndex,
        fetchedVulnerabilities,
        this.log,
      );

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        vulnerabilitiesIndex = (
          userConfig.elasticsearch.dataIndices.githubVulnerabilities +
          getId(currentSource.name)
        ).toLocaleLowerCase();
      }
    }
    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      // Create an alias used for group querying
      await aliasEsIndex(
        eClient,
        userConfig.elasticsearch.dataIndices.githubVulnerabilities,
        this.log,
      );
    }
  }
}
