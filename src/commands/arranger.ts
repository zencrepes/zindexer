import { flags } from '@oclif/command';
import cli from 'cli-ux';
import gql from 'graphql-tag';

import Command from '../base';
import arClient from '../utils/arranger/arClient';

import getProjects from '../utils/arranger/getProjects';
import createProject from '../utils/arranger/createProject';
import deleteProject from '../utils/arranger/deleteProject';
import createIndex from '../utils/arranger/createIndex';

export default class GIssues extends Command {
  static description = 'Configure Arranger indices';

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
    const projectId = userConfig.arranger.project;
    const aClient = await arClient(userConfig.arranger);

    this.log('Looking in Arranger for project: ' + projectId);
    const projects = await getProjects(aClient, this.log);

    //By default if project exists, we first delete it.
    if (
      projects.find((p: { id: string }) => p.id === projectId) !== undefined
    ) {
      this.log('Project: ' + projectId + ' already exists, deleting');
      const deletedProject = await deleteProject(aClient, this.log, projectId);
    } else {
      this.log('Project: ' + projectId + ' does not exist');
    }

    this.log('Creating project: ' + projectId + ' in arranger');
    const createdProject = await createProject(aClient, this.log, projectId);

    for (const [graphqlField, esIndex] of Object.entries(
      userConfig.elasticsearch.dataIndices,
    )) {
      if (
        ['githubIssues', 'githubRepos', 'githubPullrequests'].find(
          n => n === graphqlField,
        ) !== undefined
      ) {
        cli.action.start('Creating GraphQL node for datatype: ' + graphqlField);
        await createIndex(
          aClient,
          this.log,
          projectId,
          graphqlField,
          esIndex + '*', // Adding '*' to alias across all indices of the same datatype
        );
        cli.action.stop();
      }
    }
  }
}
