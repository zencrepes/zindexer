import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';
import esClient from '../utils/es/esClient';
import chunkArray from '../utils/misc/chunkArray';
import { getId } from '../utils/misc/getId';
import { ESIndexSources, ConfigJira, JiraProject } from '../global';
import ymlMappingsJProjects from '../schemas/jProjects';
import esGetActiveSources from '../utils/es/esGetActiveSources';
import esCheckIndex from '../utils/es/esCheckIndex';
import fetchData from '../utils/jira/fetchData';

export default class JProjects extends Command {
  static description = 'Jira: Fetches project data from configured sources';

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
    // Split the array by jira server
    for (const jiraServer of userConfig.jira.filter(
      (p: ConfigJira) => p.enabled === true,
    )) {
      const sources = await esGetActiveSources(eClient, userConfig, 'JIRA');
      if (sources.length === 0) {
        this.error(
          'The script could not find any active sources. Please configure sources first.',
          { exit: 1 },
        );
      }
      const projects = [];
      for (const source of sources.filter(
        (s: ESIndexSources) => s.server === jiraServer.name,
      )) {
        cli.action.start('Fetching data for project: ' + source.name);
        console.log('Getting overall project data');
        const projectData = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id,
        );
        console.log('Getting project properties');
        const projectProperties = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/properties',
        );
        console.log('Getting project roles');
        const projectRolesRaw = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/role',
        );
        const projectRoles: Array<object> = [];
        for (const endpointValue of Object.values(projectRolesRaw)) {
          console.log(
            'Getting project roles - fetching additional data from: ' +
              endpointValue,
          );
          const projectRoleData = await fetchData(
            userConfig,
            source.server,
            String(endpointValue),
          );
          projectRoles.push(projectRoleData);
        }

        console.log('Getting notification scheme');
        const projectNotificationsScheme = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/notificationscheme',
        );

        console.log('Getting permissions scheme');
        const projectPermissionsScheme = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/permissionscheme',
        );

        console.log('Getting priority scheme');
        const projectPriorityScheme = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/priorityscheme',
        );

        console.log('Getting project security level');
        const projectSecurityLevel = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/securitylevel',
        );

        projects.push({
          ...projectData,
          properties: projectProperties,
          roles: projectRoles,
          notificationsScheme: projectNotificationsScheme,
          permissionsScheme: projectPermissionsScheme,
          priorityScheme: projectPriorityScheme,
          securityLevel: projectSecurityLevel,
        });
        cli.action.stop(' done');
      }

      //Break down the issues response in multiple batches
      const esPayloadChunked = await chunkArray(projects, 100);
      //Push the results back to Elastic Search
      const esIndex =
        userConfig.elasticsearch.dataIndices.jiraProjects +
        getId(jiraServer.name);

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, esIndex, ymlMappingsJProjects);

      for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
        cli.action.start(
          'Submitting data to ElasticSearch into ' +
            esIndex +
            ' (' +
            (idx + 1) +
            ' / ' +
            esPayloadChunked.length +
            ')',
        );
        let formattedData = '';
        for (const rec of esPayloadChunk) {
          // Trick to replace id with nodeId
          let updatedRec: any = { ...rec, nodeId: (rec as JiraProject).id };
          delete updatedRec.id;
          formattedData =
            formattedData +
            JSON.stringify({
              index: {
                _index: esIndex,
                _id:
                  getId(jiraServer.name) + (updatedRec as JiraProject).nodeId,
              },
            }) +
            '\n' +
            JSON.stringify(updatedRec) +
            '\n';
        }
        await eClient.bulk({
          index: esIndex,
          refresh: 'wait_for',
          body: formattedData,
        });
        cli.action.stop(' done');
      }
    }
  }
}
