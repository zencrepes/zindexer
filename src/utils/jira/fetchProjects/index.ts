import axios from 'axios';

import { Config } from '../../../global';

const fetchProjects = async (userConfig: Config, serverName: string) => {
  const jiraServer = userConfig.jira.find(j => j.name === serverName);
  if (jiraServer !== undefined) {
    const response = await axios({
      method: 'get',
      url: jiraServer.config.host + '/rest/api/2/project',

      auth: {
        username: jiraServer.config.username,
        password: jiraServer.config.password,
      },

      params: {
        //        os_authType: 'basic',
        //        jql: '',
        startAt: 0,
        maxResults: 150,
        //        fields: 'summary',
      },
    });
    if (response.data.length > 0) {
      return response.data;
    }
  }
  return [];
};

export default fetchProjects;
