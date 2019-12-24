import axios from 'axios';

import { Config } from '../../../global';

const fetchProjects = async (
  userConfig: Config,
  serverName: string | undefined,
  endpoint: string,
) => {
  const jiraServer = userConfig.jira.find(j => j.name === serverName);
  if (jiraServer !== undefined) {
    const response = await axios({
      method: 'get',
      url: jiraServer.config.host + endpoint,
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
      return response.data;
    }
  }
  return {};
};

export default fetchProjects;
