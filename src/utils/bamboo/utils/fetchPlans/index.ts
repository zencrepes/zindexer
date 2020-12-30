import axios from 'axios';
import { performance } from 'perf_hooks';

import { Config, BambooPlan } from '../../../../global';

const fetchPlans = async (userConfig: Config, serverName: string, startAt: number, maxResults: number) => {
  const bambooServer = userConfig.bamboo.find(j => j.name === serverName);
  if (bambooServer !== undefined) {
    const response = await axios({
      method: 'get',
      url: bambooServer.config.host + '/rest/api/latest/plan',
      auth: {
        username: bambooServer.config.username,
        password: bambooServer.config.password,
      },
      validateStatus: function(status) {
        return status >= 200 && status < 500;
      },
      params: {
        'start-index': startAt,
        'max-result': maxResults,
      },
    });
    if (response.data !== undefined) {
      return response.data.plans;
    }    
  }
}


const fetchPlansPagination = async (userConfig: Config, serverName: string, startAt: number, maxResults: number, plans: Array<BambooPlan>) => {
  console.log(
    'Start: startAt: ' +
      startAt +
      ' - maxResults: ' +
      maxResults +
      ' - issues in current cache: ' +
      plans.length,
  );
  const t0 = performance.now();
  const response = await fetchPlans(
    userConfig,
    serverName,
    startAt,
    maxResults,
  );
  const t1 = performance.now();
  const callDuration = t1 - t0;
  let addedToCache = 0;

  if (response.errorMessages !== undefined) {
    console.log(response);
    return [];
  }

  for (const newPlan of response.plan) {
    plans.push(newPlan);
  }
  addedToCache = response.plan.length;  

  const apiPerf = Math.round(response.plan.length / (callDuration / 1000));
  console.log(
    'Fetched: ' +
      response.plan.length +
      ' plans - Total: ' +
      response.size +
      ' - plans in current cache: ' +
      plans.length +
      ', download rate: ' +
      apiPerf +
      ' nodes/s',
  );

  if (
    addedToCache !== response.plan.length ||
    plans.length >= response.size
  ) {
    console.log('Plan already in cache and/or dataset up to date, stopping');
  } else {
    await fetchPlansPagination(
      userConfig,
      serverName,
      plans.length,
      maxResults,
      plans,
    );
  }
  return plans;
};

export default fetchPlansPagination;
