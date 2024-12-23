import axios from 'axios';
import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { Config, ESSearchResponse, ESIndexSources } from '../../../../global';
import sleep from '../../../../utils/misc/sleep';

const fetchRemoteLinks = async (
  userConfig: Config,
  serverName: string | undefined,
  issueKey: string,
  eClient: Client,
  issuesIndex: string,
) => {
  const jiraServer = userConfig.jira.find(j => j.name === serverName);
  if (jiraServer !== undefined) {
    cli.action.start('Fetching remote link for issue ' + issueKey);
    let response = null
    let errorCpt = 0;
    while (response === null && errorCpt < 5) {
      try {
        response = await axios({
          method: 'get',
          url:
            jiraServer.config.host +
            '/rest/api/latest/issue/' +
            issueKey +
            '/remotelink',
          auth: {
            username: jiraServer.config.username,
            password: jiraServer.config.password,
          },
          validateStatus: function(status) {
            return status >= 200 && status < 500; // default
          },
        });        
      } catch (error) {
        console.log(error);
      }
      if (response === null || response.status !== 200) {
        console.log(`Error fetching remote links, from ${issueKey} retrying in 1s`);
        errorCpt++
        sleep(1000);
      }
    }

    if (response !== null && response.data !== undefined) {
      errorCpt = 0;
      cli.action.stop(' - ' + response.data.length + ' links found');
      if (response.data.length > 0) {
        // We then add metadata about the linked issue
        const esQuery = {
          bool: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            must: [{ match_all: {} }],
            filter: [
              {
                bool: {
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  minimum_should_match: 1,
                  should: response.data
                    .filter((l: any) => !l.object.title.includes('//'))
                    .map((l: any) => {
                      return {
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        match_phrase: {
                          key: l.object.title,
                        },
                      };
                    }),
                },
              },
            ],
            should: [],
            // eslint-disable-next-line @typescript-eslint/camelcase
            must_not: [],
          },
        };
        const esIssues: ApiResponse<ESSearchResponse<
          ESIndexSources
        >> = await eClient.search({
          index: issuesIndex,
          body: {
            from: 0,
            size: 10000,
            query: esQuery,
          },
        });
        // eslint-disable-next-line @typescript-eslint/camelcase
        const foundLinks = esIssues.body.hits.hits.map((i: any) => i._source);
        return {
          key: issueKey,
          remoteLinks: response.data
            .filter((l: any) => !l.object.title.includes('//'))
            .map((l: any) => {
              const foundLinkedIssue = foundLinks.find(
                (i: any) => i.key === l.object.title,
              );
              if (foundLinkedIssue === undefined) {
                return {
                  key: l.object.title,
                  remoteLink: l,
                };
              } else {
                return {
                  ...foundLinkedIssue,
                  key: l.object.title,
                  remoteLink: l,
                };
              }
            }),
        };
      }
    }
    cli.action.stop(' - unable to find issues');
  }
  return { key: issueKey, remoteLinks: [] };
};

export default fetchRemoteLinks;
