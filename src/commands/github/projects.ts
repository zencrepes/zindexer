import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';
import esGithubLatest from '../../utils/es/esGithubLatest';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import fetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import esCheckIndex from '../../utils/es/esCheckIndex';

import { getId } from '../../utils/misc/getId';

import fetchGqlRepo from '../../utils/github/projects/fetchGql';
import fetchGqlOrg from '../../utils/github/projects/fetchGqlOrg';
import esMapping from '../../utils/github/projects/esMapping';
import fetchReposWithData from '../../utils/github/projects/fetchReposWithData';
import zConfig from '../../utils/github/projects/zConfig';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Projects extends Command {
  static description = 'Github: Fetches projects data from configured sources';

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
    const { flags } = this.parse(Projects);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubProjects,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchDataRepo = new fetchNodesUpdated(
      gClient,
      fetchGqlRepo,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    const fetchDataOrg = new fetchNodesUpdated(
      gClient,
      fetchGqlOrg,
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
    cli.action.stop(' done');

    //Fetch projects attached to an organization.
    //1- Get list of organizations
    const uniqueOrgs: string[] = [];
    for (const repo of reposData) {
      if (!uniqueOrgs.includes(repo.owner.id)) {
        uniqueOrgs.push(repo.owner.id);
      }
    }

    for (const orgId of uniqueOrgs) {
      const processedOrg = reposData.find((r: any) => r.owner.id === orgId);
      cli.action.start(
        'Grabbing projects attached to Org: ' +
          processedOrg.owner.login +
          ' (ID: ' +
          processedOrg.owner.id +
          ')',
      );
      let fetchedProjects = await fetchDataOrg.load(
        processedOrg.owner.id,
        null,
      );

      let projectsIndex = userConfig.elasticsearch.dataIndices.githubProjects;
      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        projectsIndex = (
          userConfig.elasticsearch.dataIndices.githubProjects +
          getId(processedOrg.owner.login)
        ).toLocaleLowerCase();
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, projectsIndex, esMapping);

      await esPushNodes(fetchedProjects, projectsIndex, eClient);

      cli.action.stop(' done');
    }

    const reposWithData = reposData
      .filter((r: any) => r.projects.totalCount > 0)
      .map((r: any) => r.id);
    cli.action.stop(' done');

    const sourcesWithData = sources.filter(s => reposWithData.includes(s.id));
    console.log(
      'Found: ' +
        reposWithData.length +
        ' repos with Milestones, fetching corresponding data',
    );

    for (const currenSource of sourcesWithData) {
      let projectsIndex = userConfig.elasticsearch.dataIndices.githubProjects;

      this.log('Processing source: ' + currenSource.name);
      const recentProject = await esGithubLatest(
        eClient,
        projectsIndex,
        currenSource.id,
      );
      cli.action.start(
        'Grabbing projects for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      let fetchedProjects = await fetchDataRepo.load(
        currenSource.id,
        recentProject,
      );
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedProjects = fetchedProjects.map((item: any) => {
        return {
          ...item,
          // eslint-disable-next-line @typescript-eslint/camelcase
          zindexer_sourceid: currenSource.id,
        };
      });

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        projectsIndex = (
          userConfig.elasticsearch.dataIndices.githubProjects +
          getId(currenSource.name)
        ).toLocaleLowerCase();
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, projectsIndex, esMapping);

      await esPushNodes(fetchedProjects, projectsIndex, eClient);
    }

    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      // Create an alias used for group querying
      cli.action.start(
        'Creating the Elasticsearch index alias: ' +
          userConfig.elasticsearch.dataIndices.githubProjects,
      );
      await eClient.indices.putAlias({
        index: userConfig.elasticsearch.dataIndices.githubProjects + '*',
        name: userConfig.elasticsearch.dataIndices.githubProjects,
      });
      cli.action.stop(' done');
    }
  }
}
