import axios from 'axios';

import { Config } from '../../../../global';

const fetchProjects = async (
  userConfig: Config,
  serverName: string | undefined,
  apiCall: { key: string; endpoint: string },
) => {
  const jiraServer = userConfig.jira.find(j => j.name === serverName);
  if (
    jiraServer !== undefined &&
    !Array.isArray(apiCall.endpoint) &&
    apiCall.endpoint.length > 0
  ) {
    const serverUrl =
      jiraServer.config.host +
      apiCall.endpoint.replace(jiraServer.config.host, '');
    const response = await axios({
      method: 'get',
      url: serverUrl,
      auth: {
        username: jiraServer.config.username,
        password: jiraServer.config.password,
      },
      validateStatus: function(status) {
        return status >= 200 && status < 500; // default
      },
      params: {
        //        os_authType: 'basic',
        //        jql: '',
        startAt: 0,
        maxResults: 150,
        //        fields: 'summary',
      },
    });
    if (response.data !== undefined) {
      if (apiCall.key !== undefined) {
        return { key: apiCall.key, data: response.data };
      }
      return response.data;
    }
  }
  if (apiCall.key !== undefined) {
    return { key: apiCall.key, data: {} };
  }
  return {};
};

export default fetchProjects;
