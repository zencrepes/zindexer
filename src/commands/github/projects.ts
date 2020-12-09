import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';
import esGithubLatest from '../../utils/es/esGithubLatest';
import esGithubClear from '../../utils/es/esGithubClear';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import fetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import { GithubNode } from '../../global';

import esCheckIndex from '../../utils/es/esCheckIndex';

import { getId } from '../../utils/misc/getId';

import {
  esMapping,
  esSettings,
  fetchNodes,
  fetchNodesOrg,
  zConfig,
  ingestNodes,
  fetchReposWithData,
} from '../../components/githubProjects';

import {
  getEsIndex,
  checkEsIndex,
  pushEsNodes,
  aliasEsIndex,
} from '../../components/esUtils/index';

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
    all: flags.boolean({
      char: 'a',
      default: false,
      description: 'Clear nodes before fetching all of them again',
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
      fetchNodes,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    const fetchDataOrg = new fetchNodesUpdated(
      gClient,
      fetchNodesOrg,
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
    const uniqueOrgs: any[] = [];
    for (const repo of reposData) {
      if (!uniqueOrgs.find(o => o.id === repo.owner.id) === undefined) {
        uniqueOrgs.push(repo.owner);
      }
    }

    for (const currentOrg of uniqueOrgs) {
      const processedOrg = reposData.find(
        (r: any) => r.owner.id === currentOrg.id,
      );
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

      fetchedProjects = ingestNodes(
        fetchedProjects,
        'zindexer',
        'organization',
        null,
        currentOrg,
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
      .filter((r: any) => r !== null)
      .filter((r: any) => r.projects.totalCount > 0)
      .map((r: any) => r.id);
    cli.action.stop(' done');

    const sourcesWithData = sources.filter(s => reposWithData.includes(s.id));
    console.log(
      'Found: ' +
        reposWithData.length +
        ' repos with Milestones, fetching corresponding data',
    );

    for (const currentSource of sourcesWithData) {
      let projectsIndex = userConfig.elasticsearch.dataIndices.githubProjects;

      this.log('Processing source: ' + currentSource.name);
      
      let recentProject: GithubNode | null = null;
      // Clear all issues in current repository
      // It's necessary to clear since we want to also delete nodes that might not exist remotely anymore
      if (flags.all === true) {
        await esGithubClear(
          eClient,
          projectsIndex,
          currentSource.id,
        );        
      } else {
        recentProject = await esGithubLatest(
          eClient,
          projectsIndex,
          currentSource.id,
        );
      }      

      cli.action.start(
        'Grabbing projects for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedProjects = await fetchDataRepo.load(
        currentSource.id,
        recentProject,
      );
      cli.action.stop(' done');

      if (currentSource.repository !== undefined) {
        fetchedProjects = ingestNodes(
          fetchedProjects,
          'zindexer',
          'repository',
          currentSource.id,
          currentSource.repository.owner,
          currentSource.repository,
        );
      }

      projectsIndex = getEsIndex(
        userConfig.elasticsearch.dataIndices.githubProjects,
        userConfig.elasticsearch.oneIndexPerSource,
        currentSource.name,
      );

      await checkEsIndex(
        eClient,
        projectsIndex,
        esMapping,
        esSettings,
        this.log,
      );
      await pushEsNodes(eClient, projectsIndex, fetchedProjects, this.log);
    }

    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      // Create an alias used for group querying
      await aliasEsIndex(
        eClient,
        userConfig.elasticsearch.dataIndices.githubProjects,
        this.log,
      );
    }
  }
}
