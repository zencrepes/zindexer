import axios from 'axios';

import { Config, JiraIssue } from '../../../../global';

const fetchJql = async (
  userConfig: Config,
  serverName: string | undefined,
  jqlQuey: string,
  fields: string,
  startAt: number,
  maxResults: number,
) => {
  const jiraServer = userConfig.jira.find(j => j.name === serverName);
  if (jiraServer !== undefined) {
    const response = await axios({
      method: 'get',
      url: jiraServer.config.host + '/rest/api/2/search',
      auth: {
        username: jiraServer.config.username,
        password: jiraServer.config.password,
      },
      validateStatus: function(status) {
        return status >= 200 && status < 500;
      },
      params: {
        jql: jqlQuey,
        startAt: startAt,
        maxResults: maxResults,
        fields: fields,
      },
    });
    if (response.data !== undefined) {
      return response.data;
    }
  }
  return {};
};

const fetchJqlPagination = async (
  userConfig: Config,
  serverName: string | undefined,
  jqlQuey: string,
  fields: string,
  issue: JiraIssue | null,
  startAt: number,
  maxResults: number,
  issues: Array<JiraIssue>,
) => {
  console.log(
    'Start: startAt: ' +
      startAt +
      ' - maxResults: ' +
      maxResults +
      ' - issues in current cache: ' +
      issues.length,
  );
  const response = await fetchJql(
    userConfig,
    serverName,
    jqlQuey,
    fields,
    startAt,
    maxResults,
  );
  let addedToCache = 0;

  if (issue === null) {
    for (const newIssue of response.issues) {
      issues.push(newIssue);
    }
    addedToCache = response.issues.length;
  } else {
    addedToCache = 0;
    for (const newIssue of response.issues) {
      if (
        newIssue.key === issue.key &&
        newIssue.fields.updated === issue.fields.updated
      ) {
        break;
      } else {
        issues.push(newIssue);
        addedToCache++;
      }
    }
  }
  console.log(
    'Fetched: ' +
      response.issues.length +
      ' issues - Total: ' +
      response.total +
      ' - issues in current cache: ' +
      issues.length,
  );
  if (
    addedToCache !== response.issues.length ||
    issues.length === response.total
  ) {
    console.log('Issue already in cache and/or dataset up to date, stopping');
  } else {
    await fetchJqlPagination(
      userConfig,
      serverName,
      jqlQuey,
      fields,
      issue,
      issues.length,
      maxResults,
      issues,
    );
  }
  return issues;
};

export default fetchJqlPagination;
