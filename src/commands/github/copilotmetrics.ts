import { flags } from '@oclif/command';
import axios from 'axios';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import sleep from '../../utils/misc/sleep';
import checkRateLimit from '../../utils/github/utils/checkRateLimit';

import esGetGithubCopilotmetrics from '../../utils/es/esGetGithubCopilotmetrics';

import {
  esMapping,
  esSettings,
  zConfig,
} from '../../components/githubCopilotmetrics';

import { checkEsIndex } from '../../components/esUtils/index';

import pushConfig from '../../utils/zencrepes/pushConfig';

/**
 * Generates an array of date range objects spanning a specified number of months,
 * but does not return a value of 'since' below 2025-05-06 (GitHub API limitation)
 * @param startDate The date to start from (typically today)
 * @param daysInterval Number of days between since and until in each range
 * @param monthsToFetch Number of months to go back from startDate (defaults to 24 months/2 years)
 * @returns Array of date ranges in descending order
 */
const generateDateRanges = (
  startDate: Date,
  daysInterval: number,
  monthsToFetch = 24,
): Array<{ since: Date; until: Date }> => {
  const apiMinDate = new Date('2025-05-07T00:00:00Z');
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() - monthsToFetch);

  const ranges: Array<{ since: Date; until: Date }> = [];
  const currentDate = new Date(startDate);

  // Create date ranges until we reach the end date or apiMinDate
  while (currentDate > endDate) {
    const until = new Date(currentDate);

    // Go back the specified number of days for the "since" date
    currentDate.setDate(currentDate.getDate() - daysInterval);
    const since = new Date(currentDate);

    // Only add ranges where 'since' is not before apiMinDate
    if (since >= apiMinDate) {
      ranges.push({
        since: since,
        until: until,
      });
    } else {
      // If 'since' is before apiMinDate, stop adding ranges
      if (ranges.map(r => r.since).includes(apiMinDate)) {
        break;
      }
      ranges.push({
        since: apiMinDate,
        until: until,
      });
    }
  }

  return ranges;
};

export default class Copilotmetrics extends Command {
  static description =
    'Github: Fetches copilotmetrics data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    copilotOrg: flags.string({
      char: 'o',
      required: true,
      env: 'COPILOT_ORG',
      description:
        'Which copilot organization to fetch metrics from (e.g., Jahia)',
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
      description: 'Clear nodes before fetching all of them again',
    }),
  };

  async run() {
    const { flags } = this.parse(Copilotmetrics);

    const copilotmetricsIndex = this.userConfig.elasticsearch.dataIndices
      .githubCopilotmetrics;
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    const getUuid = require('uuid-by-string');

    await checkEsIndex(
      eClient,
      copilotmetricsIndex,
      esMapping,
      esSettings,
      this.log,
    );

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      copilotmetricsIndex,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const today = new Date();
    const dateRanges = generateDateRanges(
      today,
      20,
      userConfig.github.copilotApi.fetchMonths,
    );
    console.log(
      `Generated ${dateRanges.length} date ranges covering the past 6 months`,
    );

    const cpt = 0;
    let retryCpt = 0;
    const copilotMetricsData: Array<any> = [];
    for (const currentDataRange of dateRanges) {
      console.log(
        `Fetching copilot metrics from ${currentDataRange.since.toISOString()} to ${currentDataRange.since.toISOString()}`,
      );

      let response: any = {};

      while (
        (response === undefined || response.data === undefined) &&
        retryCpt < 5
      ) {
        try {
          response = await axios({
            method: 'get',
            url: `https://api.github.com/orgs/${flags.copilotOrg}/copilot/metrics`,
            headers: {
              Authorization: 'token ' + userConfig.github.token,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
            params: {
              since: currentDataRange.since.toISOString(),
              until: currentDataRange.until.toISOString(),
              // eslint-disable-next-line @typescript-eslint/camelcase
              per_page: userConfig.github.copilotApi.fetchWindow,
            },
          });
        } catch (error) {
          console.log(error);
          console.log('Error fetching copilot usage metrics');
        }
        if (response.data !== undefined) {
          retryCpt = 0;
        } else {
          console.log('Error while fetching data from GitHub, retrying in 2s');
          retryCpt++;
          await sleep(2000);
        }
      }
      await sleep(250);
      await checkRateLimit(
        response.headers['x-ratelimit-reset'],
        response.headers['x-ratelimit-remaining'],
        5,
      );
      console.log(
        `(${cpt}/${dateRanges.length}) Collected ${response.data.length} days - remaining tokens: ${response.headers['x-ratelimit-remaining']}, resetAt: ${response.headers['x-ratelimit-reset']}`,
      );

      for (const metricday of response.data) {
        const collectedDays = copilotMetricsData.map(d => d.date);
        if (!collectedDays.includes(metricday.date)) {
          copilotMetricsData.push(metricday);
        }
      }
    }

    const sortedData = copilotMetricsData.sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const esExistingDays = await esGetGithubCopilotmetrics(
      eClient,
      copilotmetricsIndex,
    );
    const collectedDays = esExistingDays
      .filter((d: any) => d._source.doc.org === flags.copilotOrg)
      .map((d: any) => d._source.doc.date);

    for (const copilotMetric of sortedData) {
      if (!collectedDays.includes(copilotMetric.date)) {
        console.log(`Saving copilot metrics for date: ${copilotMetric.date}`);
        await eClient.create({
          id: getUuid(copilotMetric.date + flags.copilotOrg, 5),
          index: copilotmetricsIndex,
          body: { doc: { ...copilotMetric, org: flags.copilotOrg } },
        });
      } else {
        console.log(
          `Skipping... Copilot metrics for date: ${copilotMetric.date} were already saved.`,
        );
      }
    }

    this.exit();
  }
}
