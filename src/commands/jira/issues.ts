import { flags } from '@oclif/command';
import { ApiResponse } from '@elastic/elasticsearch';
import * as _ from 'lodash';

import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';
import { getId } from '../../utils/misc/getId';

import {
  ESIndexSources,
  ESSearchResponse,
  ConfigJira,
  JiraIssue,
} from '../../global';
import esGetActiveSources from '../../utils/es/esGetActiveSources';

import esMapping from '../../utils/jira/issues/esMapping';
import zConfig from '../../utils/jira/issues/zConfig';

import esCheckIndex from '../../utils/es/esCheckIndex';

import fetchJqlPagination from '../../utils/jira/utils/fetchJql';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Issues extends Command {
  static description = 'Jira: Fetches issues data from configured sources';

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
    const { flags } = this.parse(Issues);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.jiraIssues,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

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
        let issuesIndex = userConfig.elasticsearch.dataIndices.jiraIssues;
        if (userConfig.elasticsearch.oneIndexPerSource === true) {
          issuesIndex = (
            userConfig.elasticsearch.dataIndices.jiraIssues +
            getId(jiraServer.name) +
            '_' +
            source.id
          ).toLocaleLowerCase();
        }

        // Check if index exists, create it if it does not
        await esCheckIndex(eClient, userConfig, issuesIndex, esMapping);

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
                updatedAt: {
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
        const projectIssues = await fetchJqlPagination(
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

        //        console.log(projectIssues);
        // Jira issues will be reformated to a payload closer to GitHub's,
        // objective being to streamline the payload and easy development
        const updatedIssues = projectIssues.map((ji: any) => {
          let returnObj: any = {
            id: ji.id,
            zindexer_source: source.id,
            server: { name: jiraServer.name, host: jiraServer.config.host },
          };

          for (const field of jiraServer.config.fields.issues) {
            if (_.get(ji.fields, field.jfield) !== undefined) {
              const jValue = _.get(ji.fields, field.jfield);
              returnObj[field.zfield] =
                Array.isArray(jValue) === true
                  ? {
                      totalCount: jValue.length,
                      edges: jValue.map((v: any) => {
                        return { node: v };
                      }),
                    }
                  : jValue;
            }
          }
          return returnObj;
        });

        //Break down the issues response in multiple batches
        const esPayloadChunked = await chunkArray(updatedIssues, 100);
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
            // const updatedRec: any = { ...rec };

            // if (updatedRec.fields.assignee !== null) {
            //   delete updatedRec.fields.assignee.avatarUrls;
            // }
            // if (updatedRec.fields.creator.avatarUrls !== undefined) {
            //   delete updatedRec.fields.creator.avatarUrls;
            // }
            // if (updatedRec.fields.project.avatarUrls !== undefined) {
            //   delete updatedRec.fields.project.avatarUrls;
            // }
            // if (updatedRec.fields.reporter.avatarUrls !== undefined) {
            //   delete updatedRec.fields.reporter.avatarUrls;
            // }

            formattedData =
              formattedData +
              JSON.stringify({
                index: {
                  _index: issuesIndex,
                  _id: (rec as JiraIssue).id,
                },
              }) +
              '\n' +
              JSON.stringify(rec) +
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
      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // Create an alias used for group querying
        cli.action.start(
          'Creating the Elasticsearch index alias: ' +
            userConfig.elasticsearch.dataIndices.jiraIssues,
        );
        await eClient.indices.putAlias({
          index: userConfig.elasticsearch.dataIndices.jiraIssues + '*',
          name: userConfig.elasticsearch.dataIndices.jiraIssues,
        });
        cli.action.stop(' done');
      }
    }
  }
}
