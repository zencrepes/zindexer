import { flags } from '@oclif/command';
import * as _ from 'lodash';
import cli from 'cli-ux';
import pMap from 'p-map';
import * as fs from 'fs';
import * as path from 'path';
import * as jsYaml from 'js-yaml';
import loadYamlFile from 'load-yaml-file';

import Command from '../../base';
import { ESIndexSources, ConfigJira, JiraIssue } from '../../global';

import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';
import { getId } from '../../utils/misc/getId';
import esGetRemoteLinksSources from '../../utils/es/esGetRemoteLinksSources';
import fetchAllForProject from '../../utils/jira/utils/fetchAllForProject';
import fetchRemoteLinks from '../../utils/jira/utils/fetchRemoteLinks';
import esQueryData from '../../utils/es/esQueryData';

export default class Issues extends Command {
  static description = 'Jira: Fetches remote links from configured projects';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    enable: flags.boolean({
      char: 'e',
      required: false,
      default: false,
      description:
        'Enable fetching remote links for all JIRA sources currently enabled',
    }),    
    action: flags.string({
      char: 'a',
      options: ['ENABLE', 'LOAD', 'SAVE', 'FETCH'],
      required: false,
      default: 'FETCH',
      description:
        'Action to be performed. (SAVE locally, LOAD into es, FETCH from Jira)',
    }),
  };

/*
POST /sources/_doc/ae7b07d1-3373-58b9-a771-09b1e121e98c
{
  "uuid": "ae7b07d1-3373-58b9-a771-09b1e121e98c",
  "id": "JAHIA_SUP",
  "type": "JIRA",
  "server": "JAHIA",
  "project": "SUP",
  "name": "JAHIA_SUP",
  "active": true,
  "remoteLinks": true
}
*/

  async run() {
    const { flags } = this.parse(Issues);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    let esPayload: Array<ESIndexSources> = [];

    // Get all of the sources
    const dataSources: Array<ESIndexSources> = await esQueryData(
      eClient,
      userConfig.elasticsearch.sysIndices.sources,
      {
        from: 0,
        size: 10000,
        query: {
          match_all: {}, // eslint-disable-line
        },
      },
    );


    if (flags.enable === true) {
      // Enable fetching remote links for all JIRA sources currently enabled
      this.log('Enabling fetching remote links for all JIRA sources currently enabled');
      dataSources.map(source => {
        if (source.type === 'JIRA' && source.active === true) {
          this.log('Enabling for JIRA project: ' + source.name);
          source.remoteLinks = true;
        } else if (source.type === 'JIRA' && source.active === false && source.remoteLinks === true) {
          this.log('Disabling for JIRA project: ' + source.name);
          source.remoteLinks = false;
        }
        return source;
      })
      const esPayloadChunked = await chunkArray(dataSources, 100);
      for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
        cli.action.start(
          'Submitting data to ElasticSearch (' +
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
                _index: userConfig.elasticsearch.sysIndices.sources,
                _id: (rec as ESIndexSources).uuid,
              },
            }) +
            '\n' +
            JSON.stringify(rec) +
            '\n';
        }
        await eClient.bulk({
          index: userConfig.elasticsearch.sysIndices.sources,
          refresh: 'wait_for',
          body: formattedData,
        });
        cli.action.stop(' done');
      }
    }

    if (flags.action === 'SAVE') {
        this.log('Filtering out any non-JIRA sources');
      const jiraDataSources = dataSources.filter(
        (s: ESIndexSources) => s.type === 'JIRA',
      );
      const configArray = jiraDataSources.map(source => {
        return {
          [source.type + '/' + source.name]:
            source.remoteLinks === undefined ? false : source.remoteLinks,
        };
      });
      fs.writeFileSync(
        path.join(this.config.configDir, 'jira-remote-links.yml'),
        jsYaml.safeDump(configArray),
      );
      cli.action.stop(' done');
      this.log(
        'You can enable/disable Remote Links for JIRA sources in: ' +
          path.join(this.config.configDir, 'jira-remote-links.yml'),
      );
    } else if (flags.action === 'LOAD') {
      // Load from local file into ES

      //Math the data with the config file
      cli.action.start(
        'Grabbing sources configuration from file: ' +
          path.join(this.config.configDir, 'jira-remote-links.yml'),
      );
      let sourcesConfig: Array<object> = [];
      if (
        fs.existsSync(path.join(this.config.configDir, 'jira-remote-links.yml'))
      ) {
        sourcesConfig = await loadYamlFile(
          path.join(this.config.configDir, 'jira-remote-links.yml'),
        );
      } else {
        this.error(
          'Unable to find the config file (' +
            path.join(this.config.configDir, 'jira-remote-links.yml') +
            '), please run the SAVE action first',
          { exit: 1 },
        );
      }
      cli.action.stop(' done');

      cli.action.start(
        'Comparing Elasticsearch data with flags in configuration file',
      );
      esPayload = dataSources.map(source => {
        const cfgSource = _.find(
          sourcesConfig,
          (o: object) => (o as any)['JIRA/' + source.name] !== undefined,
        );
        if (cfgSource !== undefined) {
          if (Object.values(cfgSource)[0] !== source.remoteLinks) {
            this.log(
              'Changing: ' +
                source.name +
                ' from: ' +
                source.remoteLinks +
                ' to: ' +
                Object.values(cfgSource)[0],
            );
          }
          return {
            ...source,
            remoteLinks: Object.values(cfgSource)[0],
          };
        } else {
          return source;
        }
      });
      cli.action.stop(' done');

      this.log(
        'About to submit (create or update) data about ' +
          esPayload.length +
          ' source(s) to Elasticsearch',
      );

      //Split the array in chunks of 100
      const esPayloadChunked = await chunkArray(esPayload, 100);
      // Push the data back to elasticsearch
      for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
        cli.action.start(
          'Submitting data to ElasticSearch (' +
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
                _index: userConfig.elasticsearch.sysIndices.sources,
                _id: (rec as ESIndexSources).uuid,
              },
            }) +
            '\n' +
            JSON.stringify(rec) +
            '\n';
        }
        await eClient.bulk({
          index: userConfig.elasticsearch.sysIndices.sources,
          refresh: 'wait_for',
          body: formattedData,
        });
        cli.action.stop(' done');
      }
    } else if (flags.action === 'FETCH') {
      for (const jiraServer of userConfig.jira.filter(
        (p: ConfigJira) => p.enabled === true,
      )) {
        const sources = await esGetRemoteLinksSources(
          eClient,
          userConfig,
          'JIRA',
        );
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

          this.log(source.name + ': Fetching all issues for project');
          // Fetches all issues for a particular project
          const issues: any[] = await fetchAllForProject(
            eClient,
            issuesIndex,
            source.id,
          );

          this.log(
            source.name + ': Fetching all remote links for project issues',
          );
          // Fetch data from Jira using concurrent calls
          const issuesKeys = issues.map((i: any) => i.key);
          const mapper = async (issueKey: string) => {
            const links = await fetchRemoteLinks(
              userConfig,
              source.server,
              issueKey,
              eClient,
              issuesIndex,
            );
            return links;
          };
          const result = await pMap(issuesKeys, mapper, {
            concurrency: jiraServer.config.concurrency,
          });

          this.log(source.name + ': Mapping links to existing issues');
          const updatedIssues = issues.map((i: any) => {
            const links = result.find((r: any) => r.key === i.key);
            const remoteLinks =
              links === undefined
                ? { totalCount: 0, edges: [] }
                : {
                    totalCount: links.remoteLinks.length,
                    edges: links.remoteLinks.map((l: any) => {
                      return { node: l };
                    }),
                  };
            return {
              ...i,
              remoteLinks,
            };
          });

          //Break down the issues response in multiple batches
          this.log(source.name + ': Pushing results to Elasticsearch');
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
}
