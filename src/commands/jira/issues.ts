import { flags } from '@oclif/command';
import { ApiResponse } from '@elastic/elasticsearch';
import * as _ from 'lodash';

import cli from 'cli-ux';

import { Downloader } from 'nodejs-file-downloader';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';
import { getId } from '../../utils/misc/getId';
import fetchAllIssues from '../../utils/import/fetchAllIssues';

import {
  ESIndexSources,
  ESSearchResponse,
  ConfigJira,
  JiraIssue,
} from '../../global';
import esGetActiveSources from '../../utils/es/esGetActiveSources';

import esMapping from '../../utils/jira/issues/esMapping';
import zConfig from '../../utils/jira/issues/zConfig';
import getSprint from '../../utils/jira/issues/getSprint';

import esCheckIndex from '../../utils/es/esCheckIndex';

import fetchJqlPagination from '../../utils/jira/utils/fetchJql';

import pushConfig from '../../utils/zencrepes/pushConfig';
import { getSafeFilename } from '../../utils/misc/getSafeFilename';

//https://medium.com/javascript-in-plain-english/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
const isObject = (obj: any) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

/* This functions cleans the object from any avatarUrl crap (numerical indices)*/
const cleanObject = (obj: any) => {
  const newObject: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isObject(value)) {
      newObject[key] = cleanObject(value);
    } else {
      if (key === '16x16') {
        newObject['xsmall'] = value;
      } else if (key === '24x24') {
        newObject['small'] = value;
      } else if (key === '32x32') {
        newObject['medium'] = value;
      } else if (key === '48x48') {
        newObject['large'] = value;
      } else {
        newObject[key] = value;
      }
    }
  }
  return newObject;
};

/* This reformat an issue, from Jira's data model to ZenCrepes data model*/
const formatIssue = (issue: any, serverConfig: ConfigJira["config"]) => {
  const modifiedObj: any = {};
  if (issue.key !== undefined) {
    modifiedObj['key'] = issue.key;
  }
  if (issue.id !== undefined) {
    modifiedObj['id'] = issue.id;
  }
  for (const field of serverConfig.fields.issues) {
    if (_.get(issue.fields, field.jfield) !== undefined) {
      const jValue = _.get(issue.fields, field.jfield);
      if (Array.isArray(jValue) === true) {
        modifiedObj[field.zfield] = {
          totalCount: jValue.length,
          edges: jValue.map((v: any) => {
            if (field.zfield === 'labels') {
              return {
                node: {
                  id: v,
                  name: v,
                },
              };
            } else if (field.zfield === 'sprints') {
              return {
                node: getSprint(v),
              };
            } else if (field.zfield === 'attachments') {
              const safeFilename = getSafeFilename(v.filename);
              return {
                node: {
                  ...v,
                  safeFilename: safeFilename,
                  urlPath: `${issue.fields.project.key}/${issue.key}`,
                  remoteBackupUrl: `${serverConfig.attachments.remoteHost}/${issue.fields.project.key}/${issue.key}/${safeFilename}`,
                },
              };           
            } else if (v.outwardIssue !== null || v.inwardIssue !== null) {
              // We are going through an issue link, we need to clean the sub issue
              const outwardIssue =
                v.outwardIssue === null || v.outwardIssue === undefined
                  ? null
                  : formatIssue(v.outwardIssue, serverConfig);
              const inwardIssue =
                v.inwardIssue === null || v.inwardIssue === undefined
                  ? null
                  : formatIssue(v.inwardIssue, serverConfig);
              return {
                node: {
                  ...v,
                  outwardIssue,
                  inwardIssue,
                },
              };
            } else if (v.body !== undefined) {
              // We're going through a list of comments
              return {
                node: {
                  id: v.id,
                  self: v.self,
                  author: v.author,
                  body: v.body,
                  updateAuthor: v.updateAuthor,
                  created: v.created,
                  updated: v.updated,
                },
              };
            } else if (v.field !== undefined) {
              // We're going through a list of issues
              return {
                node: formatIssue(v, serverConfig),
              };
            } 
            return { node: v };
          }),
        };
      } else {
        if (field.jfield === 'parent') {
          modifiedObj[field.zfield] = formatIssue(jValue, serverConfig);
        } else {
          modifiedObj[field.zfield] = jValue;
        }
      }
    }
  }
  return modifiedObj;
};

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
    all: flags.boolean({
      char: 'a',
      default: false,
      description: 'Delete all issues from Elasticsearch and fetch all again',
    }),
    project: flags.string({
      char: 'p',
      description: 'Fetch issues for a particular source ID',
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
      for (const source of sources
        .filter((s: ESIndexSources) => s.server === jiraServer.name)
        .filter(
          (s: ESIndexSources) =>
            flags.project === undefined || flags.project === s.id,
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

        let recentIssue = null;
        if (flags.all === true) {
          // If refresh flag is true, delete all issues and refetch
          cli.action.start('Deleting all issues for project: ' + source.name);
          await eClient.deleteByQuery({
            index: issuesIndex,
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
          cli.action.stop();
        } else {
          //B - Find the most recent issue for that project
          const searchResult: ApiResponse<ESSearchResponse<
            JiraIssue
          >> = await eClient.search({
            index: issuesIndex,
            body: {
              query: {
                match: {
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  zindexerSourceId: {
                    query: source.id,
                  },
                },
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
          if (searchResult.body.hits.hits.length > 0) {
            recentIssue = searchResult.body.hits.hits[0]._source;
          }
        }

        cli.action.start('Fetching issues for project: ' + source.name);
        const projectIssues = await fetchJqlPagination(
          userConfig,
          source.server,
          'project = "' + source.project + '" ORDER BY updated DESC',
          '*all,comment',
          recentIssue,
          0,
          jiraServer.config.fetch.maxNodes,
          [],
        );
        cli.action.stop(' done');

        // Jira issues will be reformated to a payload closer to GitHub's,
        // objective being to streamline the payload and easy development
        const updatedIssues = projectIssues
          .map((ji: any) => {
            const formattedIssue = formatIssue(
              {
                ...ji,
                fields: {
                  ...ji.fields,
                },
              },
              jiraServer.config,
            );
            return {
              ...{
                id: ji.id,
                key: ji.key,
                //                source: ji,
                // eslint-disable-next-line @typescript-eslint/camelcase
                zindexerSourceId: source.id,
                updatedAt: ji.fields.updated,
                server: {
                  name: jiraServer.name,
                  host: jiraServer.config.host,
                },
                url: jiraServer.config.host + '/browse/' + ji.key,
              },
              ...formattedIssue,
            };
          })
          .map((ji: any) => cleanObject(ji));

        // Download files associated with the issues
        const attachmentsCount = updatedIssues.reduce((acc, i) => {
          return acc + i.attachments.totalCount;
        }, 0)        
        this.log(`Downloading ${attachmentsCount} issues attachments`);
        let cpt = 1;
        for (const issue of updatedIssues) {
          for (const attachment of issue.attachments.edges) {
            const downloadPath = `${jiraServer.config.attachments.localPath}/${attachment.node.urlPath}`;
            const downloader = new Downloader({
              url: attachment.node.content,
              directory: downloadPath,
              fileName: attachment.node.safeFilename,
              cloneFiles: false,
              skipExistingFileName: true,         
            });
            cli.action.start(`Downloading locally (${cpt}/${attachmentsCount}): ${attachment.node.safeFilename}`);
            try {
              const dlFile = await downloader.download();
              cpt++
              if (dlFile.downloadStatus === 'ABORTED') {
                cli.action.stop(` done (ALREADY EXISTS)`);
              } else {
                cli.action.stop(` done (${dlFile.downloadStatus})`);
              }
            } catch (error) {
              console.log(error);
            }   
          }
        }

        //Break down the issues response in multiple batches
        this.log(`Submitting ${updatedIssues.length} issues to ElasticSearch`);
        const submissionErrors = []
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
            formattedData =
              formattedData +
              JSON.stringify({
                index: {
                  _index: issuesIndex,
                  _id: source.id + '_' + (rec as JiraIssue).id,
                },
              }) +
              '\n' +
              JSON.stringify(rec) +
              '\n';
          }
          const resp = await eClient.bulk({
            index: issuesIndex,
            refresh: 'wait_for',
            body: formattedData,
          });
          // Record errors during submission
          for (const i of resp.body.items) {
            if (i.index.error !== undefined) {
              submissionErrors.push({
                ...i
              });
            }
          }
          cli.action.stop(' done');
        }

        if (submissionErrors.length > 0) {
          this.log(`${submissionErrors.length} errors were encountered during the submission to ElasticSearch`);
          for (const e of submissionErrors) {
            const issue = updatedIssues.find(i => i.id === e.index._id.replace(source.id + '_', ""));
            this.log(`Issue key: ${issue.key}`);
            this.log(e);
          }
          this.log(`Please fix these errors, clean the index and submit the data again`);
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
