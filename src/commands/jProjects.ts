import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as jsYaml from 'js-yaml';

import Command from '../base';
import esClient from '../utils/es/esClient';
import chunkArray from '../utils/misc/chunkArray';
import { getId } from '../utils/misc/getId';
import { ESIndexSources, ConfigJira, JiraProject } from '../global';
import esGetActiveSources from '../utils/es/esGetActiveSources';
import fetchData from '../utils/jira/fetchData';

import YmlProjects from '../schemas/jiraProjects';
import YmlSettings from '../schemas/settings';

export default class JProjects extends Command {
  static description = 'Jira: Fetches project data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;
    const client = await esClient(userConfig.elasticsearch);
    // Split the array by jira server
    for (const jiraServer of userConfig.jira.filter(
      (p: ConfigJira) => p.enabled === true,
    )) {
      const sources = await esGetActiveSources(client, userConfig, 'JIRA');
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
        const projectData = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id,
        );
        const projectProperties = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/properties',
        );
        const projectRoles = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/role',
        );
        const projectNotificationsScheme = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/notificationscheme',
        );
        const projectPermissionsScheme = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/permissionscheme',
        );
        const projectPriorityScheme = await fetchData(
          userConfig,
          source.server,
          '/rest/api/2/project/' + source.id + '/priorityscheme',
        );
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
        userConfig.elasticsearch.indices.jiraProjects + getId(jiraServer.name);

      // Test if the index exists, create if it does not
      const testIndex = await client.indices.exists({ index: esIndex });
      if (testIndex.body === false) {
        cli.action.start(
          'Elasticsearch Index ' + esIndex + ' does not exist, creating',
        );
        const mappings = await jsYaml.safeLoad(YmlProjects);
        const settings = await jsYaml.safeLoad(YmlSettings);
        await client.indices.create({
          index: esIndex,
          body: { settings, mappings },
        });
        cli.action.stop(' created');
      }

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
          formattedData =
            formattedData +
            JSON.stringify({
              index: {
                _index: esIndex,
                _id: getId(jiraServer.name) + (rec as JiraProject).id,
              },
            }) +
            '\n' +
            JSON.stringify(rec) +
            '\n';
        }
        await client.bulk({
          index: esIndex,
          refresh: 'wait_for',
          body: formattedData,
        });
        cli.action.stop(' done');
      }
    }
  }
}
