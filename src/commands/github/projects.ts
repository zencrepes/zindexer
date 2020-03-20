import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import esGithubLatest from '../../utils/es/esGithubLatest';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import esCheckIndex from '../../utils/es/esCheckIndex';

import { getId } from '../../utils/misc/getId';

import fetchGql from '../../utils/github/projects/fetchGql';
import esMapping from '../../utils/github/projects/esMapping';

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
      const projectsIndex = (
        userConfig.elasticsearch.dataIndices.githubProjects +
        getId(currenSource.name)
      ).toLocaleLowerCase();
      this.log('Processing source: ' + currenSource.name);
      const recentProject = await esGithubLatest(eClient, projectsIndex);
      cli.action.start(
        'Grabbing projects for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      const fetchedProjects = await fetchData.load(
        currenSource.id,
        recentProject,
      );
      cli.action.stop(' done');

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, projectsIndex, esMapping);

      await esPushNodes(fetchedProjects, projectsIndex, eClient);

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
