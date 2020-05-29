import { flags } from '@oclif/command';

import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import { getId } from '../../utils/misc/getId';

import esGetActiveSources from '../../utils/es/esGetActiveSources';


import esMapping from '../../utils/circleci/insights/esMapping';
import zConfig from '../../utils/circleci/insights/zConfig';
import pushConfig from '../../utils/zencrepes/pushConfig';

import esCheckIndex from '../../utils/es/esCheckIndex';
import esPushNodes from '../../utils/es/esPushNodes';

import fetchData from '../../utils/circleci/utils/fetchData';

// eslint-disable-next-line
const generateNodeId = (items: any) => {
  const updatedItems = items.map((item: { id?: string; nodeId?: string }) => {
    return item;
  });
  return updatedItems;
};

export default class Insights extends Command {
  static description = 'Fetches insights data from configured sources';

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
    const { flags } = this.parse(Insights);
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.circleciInsights,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    // Get active sources from Github only
    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');
    if (sources.length === 0) {
      this.error(
        'The script could not find any active sources. Please configure sources first.',
        { exit: 1 },
      );
    }
    for (const currentSource of sources) {
      console.log('Processing insights for source: ' + currentSource.name);

      const fetchedWorkflows = await fetchData(
        'insights/gh/' + currentSource.name + '/workflows',
        userConfig.circleci.token,
        [],
      );

      // Before pushing nodes to ES, we replace id by nodeId
      let workflows = generateNodeId(fetchedWorkflows);
      // eslint-disable-next-line
      workflows = workflows.map((item: any) => {
        return {
          ...item,
          source: currentSource,
        };
      });

      // 2- Fetch all runs for a particular workflow
      let workflowRuns: Array<object> = [];
      // eslint-disable-next-line
      let workflowJobsSummary: Array<any> = [];
      let workflowJobsRuns: Array<object> = [];
      for (const workflow of workflows) {
        console.log('Fetching workflow runs for: ' + workflow.name);
        let wfRuns = await fetchData(
          'insights/gh/' + currentSource.name + '/workflows/' + workflow.name,
          userConfig.circleci.token,
          [],
        );
        wfRuns = generateNodeId(wfRuns);
        // eslint-disable-next-line
        wfRuns = wfRuns.map((wf: any) => {
          return { ...wf, workflow };
        });
        workflowRuns = [...workflowRuns, ...wfRuns];

        // 3- Fetch Jobs Summary
        console.log('Fetching jobs summary for workflow: ' + workflow.name);
        let wfJobsSummary = await fetchData(
          'insights/gh/' +
            currentSource.name +
            '/workflows/' +
            workflow.name +
            '/jobs',
          userConfig.circleci.token,
          [],
        );

        // eslint-disable-next-line
        wfJobsSummary = wfJobsSummary.map((wf: any) => {
          return {
            ...wf,
            workflow,
          };
        });
        workflowJobsSummary = [...workflowJobsSummary, ...wfJobsSummary];

        for (const job of workflowJobsSummary) {
          console.log(
            'Fetching jobs runs for workflow: ' +
              workflow.name +
              ' and job: ' +
              job.name,
          );

          // 4- Fetch Jobs Runs
          let wfJobsRuns = await fetchData(
            'insights/gh/' +
              currentSource.name +
              '/workflows/' +
              workflow.name +
              '/jobs/' +
              job.name,
            userConfig.circleci.token,
            [],
          );
          // eslint-disable-next-line
          wfJobsRuns = wfJobsRuns.map((wf: any) => {
            return {
              ...wf,
              job,
            };
          });
          workflowJobsRuns = [...workflowJobsRuns, ...wfJobsRuns];
        }
      }
      
      if (workflowJobsRuns.length > 0) {
        let insightsIndex =
          userConfig.elasticsearch.dataIndices.circleciInsights;
        if (userConfig.elasticsearch.oneIndexPerSource === true) {
          insightsIndex = (
            userConfig.elasticsearch.dataIndices.circleciInsights +
            getId(currentSource.name)
          ).toLocaleLowerCase();
        }

        await esCheckIndex(
          eClient,
          userConfig,
          insightsIndex,
          esMapping,
        );

        await esPushNodes(workflowJobsRuns, insightsIndex, eClient);
      }
    }

    // Create an alias used for group querying
    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      cli.action.start('Creating the Elasticsearch aliases');
      console.log(
        userConfig.elasticsearch.dataIndices.circleciInsights + '*',
      );
      await eClient.indices.putAlias({
        index:
          userConfig.elasticsearch.dataIndices.circleciInsights + '*',
        name: userConfig.elasticsearch.dataIndices.circleciInsights,
      });

      cli.action.stop(' done');
    }
  }
}
