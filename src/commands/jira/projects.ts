import { flags } from '@oclif/command';
import cli from 'cli-ux';
import pMap from 'p-map';
import { ApiResponse } from '@elastic/elasticsearch';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';
import { getId } from '../../utils/misc/getId';
import { ESIndexSources, ConfigJira, JiraProject } from '../../global';

import esMapping from '../../utils/jira/projects/esMapping';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import esCheckIndex from '../../utils/es/esCheckIndex';
import fetchData from '../../utils/jira/utils/fetchData';
import { fetchJql } from '../../utils/jira/utils/fetchJql';

export default class Projects extends Command {
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

    const esIndex = userConfig.elasticsearch.dataIndices.jiraProjects;

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
        // Begin with fetching everything that can be parallelized
        const apiCalls: any[] = [
          {
            key: 'projectData',
            endpoint: '/rest/api/2/project/' + source.project,
          },
          {
            key: 'properties',
            endpoint: '/rest/api/2/project/' + source.project + '/properties',
          },
          {
            key: 'projectRolesRaw',
            endpoint: '/rest/api/2/project/' + source.project + '/role',
          },
          {
            key: 'notificationsScheme',
            endpoint:
              '/rest/api/2/project/' + source.project + '/notificationscheme',
          },
          {
            key: 'permissionsScheme',
            endpoint:
              '/rest/api/2/project/' + source.project + '/permissionscheme',
          },
          {
            key: 'priorityScheme',
            endpoint:
              '/rest/api/2/project/' + source.project + '/priorityscheme',
          },
          {
            key: 'securityLevel',
            endpoint:
              '/rest/api/2/project/' + source.project + '/securitylevel',
          },
        ];

        const mapper = async (apiCall: { key: string; endpoint: string }) => {
          const data = await fetchData(userConfig, source.server, apiCall);
          return data;
        };
        const results: any[] = await pMap(apiCalls, mapper, {
          concurrency: jiraServer.config.concurrency,
        });

        const projectsData = results.find((p: any) => p.key === 'projectData');
        const projectObj: any = {};
        for (const projectData of results.filter(
          (p: any) => p.key !== 'projectData',
        )) {
          projectObj[projectData.key] = projectData.data;
        }

        const projectRoles: Array<object> = [];
        if (
          projectObj.projectRolesRaw !== undefined &&
          Object.values(projectObj.projectRolesRaw).length > 0
        ) {
          const apiNotifsCalls: any[] = [];
          for (const [key, endpointValue] of Object.entries(
            projectObj.projectRolesRaw,
          )) {
            apiNotifsCalls.push({
              key,
              endpoint: endpointValue,
            });
          }
          const mapper = async (apiNotifsCall: {
            key: string;
            endpoint: string;
          }) => {
            const data = await fetchData(
              userConfig,
              source.server,
              apiNotifsCall,
            );
            return data;
          };
          const results = await pMap(apiNotifsCalls, mapper, {
            concurrency: jiraServer.config.concurrency,
          });
          for (const projectData of results) {
            projectRoles.push(projectData.data);
          }
        }

        // Count issues for project
        const projectIssuesResponse = await fetchJql(
          userConfig,
          source.server,
          'project = "' + source.project + '" ORDER BY updated DESC',
          '*navigable',
          0,
          1,
        );
        let issuesJiraCount = 0;
        if (Object.values(projectIssuesResponse).length > 0) {
          issuesJiraCount = projectIssuesResponse.total;
        }

        // Count issues in ES for that same project
        let issuesEsCount = 0;
        try {
          const countDocuments: ApiResponse = await eClient.count({
            index: userConfig.elasticsearch.dataIndices.jiraIssues,
            body: {
              query: {
                match: {
                  zindexerSourceId: {
                    query: source.id,
                  },
                },
              },
            },
          });
          issuesEsCount = countDocuments.body.count;
        } catch (e) {
          console.log(e);
        }

        projects.push({
          ...projectsData.data,
          ...projectObj,
          roles: projectRoles,
          issues: {
            jira: issuesJiraCount,
            es: issuesEsCount,
          },
          server: { name: jiraServer.name, host: jiraServer.config.host },
        });

        cli.action.stop(' done');
      }

      //Break down the issues response in multiple batches
      const esPayloadChunked = await chunkArray(projects, 100);
      //Push the results back to Elastic Search

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, esIndex, esMapping);

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
          // eslint-disable-next-line
          const updatedRec: any = { ...rec };

          // Jira uses a numerical object key not compatible with arranger, simply removing it
          if (updatedRec.avatarUrls !== undefined) {
            delete updatedRec.avatarUrls;
          }
          if (updatedRec.lead !== null) {
            delete updatedRec.lead.avatarUrls;
          }

          formattedData =
            formattedData +
            JSON.stringify({
              index: {
                _index: esIndex,
                _id: getId(jiraServer.name) + (updatedRec as JiraProject).id,
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
