import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';
import arClient from '../utils/arranger/arClient';

import getProjects from '../utils/arranger/getProjects';
import createProject from '../utils/arranger/createProject';
import deleteProject from '../utils/arranger/deleteProject';
import createIndex from '../utils/arranger/createIndex';
import saveState from '../utils/arranger/saveState';

import gqlSaveAggsState from '../utils/arranger/graphql/saveAggsState';
import gqlSaveColumnsState from '../utils/arranger/graphql/saveColumnsState';
import gqlSaveMatchBoxState from '../utils/arranger/graphql/saveMatchBoxState';
import gqlSaveExtendedMapping from '../utils/arranger/graphql/saveExtendedMapping';

import { arrangerConfig as jiraIssuesArrangerConfig } from '../utils/arranger/arConfig/jiraIssues';
import { arrangerConfig as jiraPropjectsArrangerConfig } from '../utils/arranger/arConfig/jiraProjects';
import { arrangerConfig as githubIssuesArrangerConfig } from '../utils/github/issues/arrangerConfig';

export default class GIssues extends Command {
  static description = '(EXPERIMENTAL) Setup the indices for use with Arranger';

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

    // eslint-disable-next-line
    const arrangerConfig: any = {
      jiraIssues: jiraIssuesArrangerConfig,
      jiraProjects: jiraPropjectsArrangerConfig,
      githubIssues: githubIssuesArrangerConfig,
    };

    //By default if project exists, we first delete it.
    if (
      projects.find((p: { id: string }) => p.id === projectId) !== undefined
    ) {
      this.log('Project: ' + projectId + ' already exists, deleting');
      await deleteProject(aClient, this.log, projectId);
    } else {
      this.log('Project: ' + projectId + ' does not exist');
    }

    this.log('Creating project: ' + projectId + ' in arranger');
    await createProject(aClient, this.log, projectId);

    for (const [graphqlField, esIndex] of Object.entries(
      userConfig.elasticsearch.dataIndices,
    )) {
      if (graphqlField === 'githubIssues') {
        cli.action.start('Creating GraphQL node for datatype: ' + graphqlField);
        await createIndex(aClient, this.log, projectId, graphqlField, esIndex);
        cli.action.stop();

        if (arrangerConfig[graphqlField] !== undefined) {
          cli.action.start(
            'Pushing Arranger configuration for datatype: ' + graphqlField,
          );

          if (arrangerConfig[graphqlField].aggsState !== undefined) {
            await saveState(
              aClient,
              this.log,
              projectId,
              graphqlField,
              gqlSaveAggsState,
              arrangerConfig[graphqlField].aggsState,
            );
          }
          if (arrangerConfig[graphqlField].columnsState !== undefined) {
            await saveState(
              aClient,
              this.log,
              projectId,
              graphqlField,
              gqlSaveColumnsState,
              arrangerConfig[graphqlField].columnsState,
            );
          }
          if (arrangerConfig[graphqlField].matchBoxState !== undefined) {
            await saveState(
              aClient,
              this.log,
              projectId,
              graphqlField,
              gqlSaveMatchBoxState,
              arrangerConfig[graphqlField].matchBoxState,
            );
          }
          if (arrangerConfig[graphqlField].extendedMapping !== undefined) {
            await saveState(
              aClient,
              this.log,
              projectId,
              graphqlField,
              gqlSaveExtendedMapping,
              arrangerConfig[graphqlField].extendedMapping,
            );
          }

          cli.action.stop();
        }
      }
    }
  }
}
