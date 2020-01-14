import { flags } from '@oclif/command';
import { ApiResponse } from '@elastic/elasticsearch';

import cli from 'cli-ux';

import Command from '../base';
import esClient from '../utils/es/esClient';
import chunkArray from '../utils/misc/chunkArray';
import { getId } from '../utils/misc/getId';

import {
  ESIndexSources,
  ESSearchResponse,
  ConfigJira,
  JiraIssue,
} from '../global';
import esGetActiveSources from '../utils/es/esGetActiveSources';

import ymlMappingsJIssues from '../schemas/jIssues';
import esCheckIndex from '../utils/es/esCheckIndex';

import fetchJqlPagination from '../utils/jira/fetchJql';

export default class JIssues extends Command {
  static description = 'Jira: Fetches issues data from configured sources';

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
      for (const source of sources.filter(
        (s: ESIndexSources) => s.server === jiraServer.name,
      )) {
        // Defines index name, one index per projet and per server
        const issuesIndex = (
          userConfig.elasticsearch.dataIndices.jiraIssues +
          getId(jiraServer.name) +
          '_' +
          source.id
        ).toLocaleLowerCase();

        // Check if index exists, create it if it does not
        await esCheckIndex(
          eClient,
          userConfig,
          issuesIndex,
          ymlMappingsJIssues,
        );

        //B - Find the most recent issue
        const searchResult: ApiResponse<ESSearchResponse<
          JiraIssue
        >> = await eClient.search({
          index: issuesIndex,
          body: {
            query: {
              match_all: {}, // eslint-disable-line
            },
            size: 1,
            sort: [
              {
                'fields.updated': {
                  order: 'desc',
                },
              },
            ],
          },
        });
        let recentIssue = null;
        if (searchResult.body.hits.hits.length > 0) {
          recentIssue = searchResult.body.hits.hits[0]._source;
        }

        cli.action.start('Fetching issues for project: ' + source.name);
        const propjectIssues = await fetchJqlPagination(
          userConfig,
          source.server,
          'project = "' + source.id + '" ORDER BY updated DESC',
          '',
          recentIssue,
          0,
          jiraServer.config.fetch.maxNodes,
          [],
        );
        cli.action.stop(' done');

        //Break down the issues response in multiple batches
        const esPayloadChunked = await chunkArray(propjectIssues, 100);
        //Push the results back to Elastic Search
        for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
          cli.action.start(
            'Submitting data to ElasticSearch into ' +
              issuesIndex +
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
            const updatedRec: any = { ...rec, nodeId: (rec as JiraIssue).id };
            delete updatedRec.id;

            // Jira uses a numerical object key not compatible with arranger, simply removing it
            if (updatedRec.fields.assignee !== null) {
              delete updatedRec.fields.assignee.avatarUrls;
            }
            if (updatedRec.fields.creator.avatarUrls !== undefined) {
              delete updatedRec.fields.creator.avatarUrls;
            }
            if (updatedRec.fields.project.avatarUrls !== undefined) {
              delete updatedRec.fields.project.avatarUrls;
            }
            if (updatedRec.fields.reporter.avatarUrls !== undefined) {
              delete updatedRec.fields.reporter.avatarUrls;
            }

            formattedData =
              formattedData +
              JSON.stringify({
                index: {
                  _index: issuesIndex,
                  _id: (updatedRec as JiraIssue).nodeId,
                },
              }) +
              '\n' +
              JSON.stringify(updatedRec) +
              '\n';
          }
          await eClient.bulk({
            index: issuesIndex,
            refresh: 'wait_for',
            body: formattedData,
          });
          cli.action.stop(' done');
        }
      }
    }
  }
}
