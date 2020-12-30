import axios from 'axios';
import { performance } from 'perf_hooks';
import pMap from 'p-map';
import cli from 'cli-ux';

import { Config, ConfigBamboo } from '../../../../global';

const fetchLatestRun = async (userConfig: Config, serverName: string, planKey: string) => {
  const bambooServer = userConfig.bamboo.find(j => j.name === serverName);
  if (bambooServer !== undefined) {
    const response = await axios({
      method: 'get',
      url: bambooServer.config.host + '/rest/api/latest/result/' + planKey + '?expand=results[0]',
      auth: {
        username: bambooServer.config.username,
        password: bambooServer.config.password,
      },
      validateStatus: function(status) {
        return status >= 200 && status < 500;
      },
    });
    if (response.data !== undefined) {
      if (response.data.results.result !== undefined && response.data.results.result.length === 1) {
        return response.data.results.result[0]
      } 
    }
    return null
  }
}

const fetchIndividualRuns = async (bambooServer: ConfigBamboo, missingRunLink: string) => {
    cli.action.start('Fetching run: ' + missingRunLink);
    const response = await axios({
      method: 'get',
      url: missingRunLink,
      auth: {
        username: bambooServer.config.username,
        password: bambooServer.config.password,
      },
      validateStatus: function(status) {
        return status >= 200 && status < 500;
      },
    });
    cli.action.stop(' done');
  
    if (response.data !== undefined) {
      return response.data;
    }
}


const fetchRunsPagination = async (
  userConfig: Config,
  serverName: string | undefined,
  planKey: string | undefined,
  existingRuns: Array<number>,
) => {
  // Note: bamboo API pagination for runs is not ideal, so instead of using it, going to run multiple calls in parallel
  // If startAt is equal to 0, it's the first load, we get data about the total number of runs for a particular plan
  const bambooServer = userConfig.bamboo.find(j => j.name === serverName);
  let runs = [];
  if (bambooServer !== undefined && serverName !== undefined && planKey !== undefined) {
    const latestRun = await fetchLatestRun(userConfig, serverName, planKey)
    if (latestRun === null) {
      return []
    }
    if (existingRuns.length === 0 || (existingRuns.length > 0 && latestRun !== null && latestRun.number !== Math.max(...existingRuns))) {
      // Runs start from 1, build an array of missing run numbers between 1 and latestRun.number
      const missingRuns: Array<number> = []
      for (let i = 1; i < latestRun.number + 1; i++) {
        if (!existingRuns.includes(i)) {
          missingRuns.push(i)
        }
      }
      const missingRunsLinks = missingRuns.map((i: number) => bambooServer.config.host + '/rest/api/latest/result/' + planKey + '-' + i.toString())
      const t0 = performance.now();    
      const mapper = async (missingRunLink: string) => {
        const links = await fetchIndividualRuns(
          bambooServer,
          missingRunLink,
        );
        return links;
      };
      runs = await pMap(missingRunsLinks, mapper, {
        concurrency: bambooServer.config.concurrency
      });
      const t1 = performance.now();
      const callDuration = t1 - t0;      
      const apiPerf = Math.round(runs.length / (callDuration / 1000));
      console.log(
        'Fetched: ' +
          runs.length +
          ' runs, download rate: ' +
          apiPerf +
          ' runs/s',
      );      
    }
  }
  return runs;
};

export default fetchRunsPagination;
