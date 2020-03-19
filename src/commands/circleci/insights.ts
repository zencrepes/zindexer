import { flags } from '@oclif/command';

import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import { getId } from '../../utils/misc/getId';

import esGetActiveSources from '../../utils/es/esGetActiveSources';

import esMappingWorkflowSummary from '../../utils/circleci/insights/esMappingWorkflowSummary';
import esMappingWorkflowRuns from '../../utils/circleci/insights/esMappingWorkflowRuns';
import esMappingWorkflowJobsSummary from '../../utils/circleci/insights/esMappingWorkflowSummary';
import esMappingWorkflowJobsRuns from '../../utils/circleci/insights/esMappingWorkflowSummary';

import esCheckIndex from '../../utils/es/esCheckIndex';
import esPushNodes from '../../utils/es/esPushNodes';

import fetchData from '../../utils/circleci/utils/fetchData';

// eslint-disable-next-line
const generateNodeId = (items: any) => {
  const updatedItems = items.map((item: { id?: string; nodeId: string }) => {
    if (item.id !== undefined) {
      item.nodeId = item.id;
      delete item.id;
    }
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
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // Get active sources from Github only
    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');
    if (sources.length === 0) {
      this.error(
        'The script could not find any active sources. Please configure sources first.',
        { exit: 1 },
      );
    }
    for (const currentSource of sources) {
      // 1- Get Workflow insights
      const workflowsSummaryIndex = (
        userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsSummary +
        getId(currentSource.name)
      ).toLocaleLowerCase();

      const fetchedWorkflows = await fetchData(
        'insights/gh/' + currentSource.name + '/workflows',
        userConfig.circleci.token,
        [],
      );

      // Check if index exists, create it if it does not
      await esCheckIndex(
        eClient,
        userConfig,
        workflowsSummaryIndex,
        esMappingWorkflowSummary,
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
      await esPushNodes(workflows, workflowsSummaryIndex, eClient);

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
            if (wf.id !== undefined) {
              wf.nodeId = wf.id;
              delete wf.id;
            }
            return {
              ...wf,
              job,
            };
          });
          workflowJobsRuns = [...workflowJobsRuns, ...wfJobsRuns];
        }
      }

      // Push workflows Runs
      const workflowsRunsIndex = (
        userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsRuns +
        getId(currentSource.name)
      ).toLocaleLowerCase();

      await esCheckIndex(
        eClient,
        userConfig,
        workflowsRunsIndex,
        esMappingWorkflowRuns,
      );

      await esPushNodes(workflowRuns, workflowsRunsIndex, eClient);

      // Push workflow Jobs Summary
      const workflowsJobsSummaryIndex = (
        userConfig.elasticsearch.dataIndices.circleciInsightsJobsSummary +
        getId(currentSource.name)
      ).toLocaleLowerCase();

      await esCheckIndex(
        eClient,
        userConfig,
        workflowsJobsSummaryIndex,
        esMappingWorkflowJobsSummary,
      );

      await esPushNodes(
        workflowJobsSummary,
        workflowsJobsSummaryIndex,
        eClient,
      );

      // Push workflow Jobs Runs
      const workflowsJobsRunsIndex = (
        userConfig.elasticsearch.dataIndices.circleciInsightsJobsRuns +
        getId(currentSource.name)
      ).toLocaleLowerCase();

      await esCheckIndex(
        eClient,
        userConfig,
        workflowsJobsRunsIndex,
        esMappingWorkflowJobsRuns,
      );

      await esPushNodes(workflowJobsRuns, workflowsJobsRunsIndex, eClient);
    }

    // Create an alias used for group querying
    cli.action.start('Creating the Elasticsearch aliases');
    console.log(
      userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsSummary +
        '*',
    );
    await eClient.indices.putAlias({
      index:
        userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsSummary +
        '*',
      name:
        userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsSummary,
    });

    console.log(
      userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsRuns + '*',
    );
    await eClient.indices.putAlias({
      index:
        userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsRuns +
        '*',
      name: userConfig.elasticsearch.dataIndices.circleciInsightsWorkflowsRuns,
    });

    console.log(
      userConfig.elasticsearch.dataIndices.circleciInsightsJobsSummary + '*',
    );
    await eClient.indices.putAlias({
      index:
        userConfig.elasticsearch.dataIndices.circleciInsightsJobsSummary + '*',
      name: userConfig.elasticsearch.dataIndices.circleciInsightsJobsSummary,
    });

    console.log(
      userConfig.elasticsearch.dataIndices.circleciInsightsJobsRuns + '*',
    );
    await eClient.indices.putAlias({
      index:
        userConfig.elasticsearch.dataIndices.circleciInsightsJobsRuns + '*',
      name: userConfig.elasticsearch.dataIndices.circleciInsightsJobsRuns,
    });

    cli.action.stop(' done');
  }
}
