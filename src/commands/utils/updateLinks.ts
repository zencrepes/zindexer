import { flags } from '@oclif/command';
import cli from 'cli-ux';
import loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import ghClient from '../../utils/github/utils/ghClient';

import fetchAllIssues from '../../utils/import/fetchAllIssues';
import checkConfig from '../../utils/import/checkConfig';
import GQL_UPDATEISSUEBODY from '../../utils/import/updateIssueBody.graphql';
import GQL_RATELIMIT from '../../utils/import/getRateLimit.graphql';

import { ImportConfig } from '../../utils/import/importConfig.type';

const sleep = (ms: number) => {
  //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
  // tslint:disable-next-line no-string-based-set-timeout
  return new Promise(resolve => setTimeout(resolve, ms));
};

const checkRateLimit = async (rateLimit: any) => {
  const resetAt = rateLimit.resetAt;
  const remainingTokens = rateLimit.remaining;
  if (remainingTokens <= 105 && resetAt !== null) {
    console.log(
      'Exhausted all available tokens, will resuming querying after ' +
        new Date(resetAt * 1000),
    );
    const sleepDuration =
      new Date(resetAt * 1000).getTime() - new Date().getTime();
    console.log('Will resume querying in: ' + sleepDuration + 's');
    await sleep(sleepDuration + 10000);
    console.log('Ready to resume querying');
  }
};

export default class UpdateLinks extends Command {
  static description =
    'Scan all GitHub issues for Jira links and replaces with corresponding GitHub link';

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
    const gClient = await ghClient(userConfig.github);

    await checkConfig(this.config, this.log);
    const importConfig: ImportConfig = await loadYamlFile(
      path.join(this.config.configDir, 'import-config.yml'),
    );

    // Step 1: Importing all issues in memory
    const issuesIndex = userConfig.elasticsearch.dataIndices.githubIssues;
    const issues: any[] = await fetchAllIssues(eClient, issuesIndex);

    // This array contains the list of links that couldn't be found
    const notFound: { issueKey: string; linkedIssue: string }[] = [];
    let cpt = 0;
    for (const i of issues) {
      // Array that will include the necessary link transformations
      const filteredLinks: {
        src: string;
        srcName: string;
        dst: string;
      }[] = [];
      const findLinks = /\[(.+)\]\((https?:\/\/[^\s]+)(?: "(.+)")?\)|(https?:\/\/[^\s]+)/gi;

      const found = i.body.match(findLinks);
      if (found !== null) {
        for (const mkLink of found) {
          const urlEx = /\(([^)]+)\)/g;
          const urlMatches = urlEx.exec(mkLink);
          let url = '';
          let urlTxt = '';
          if (urlMatches !== null && urlMatches[1] !== undefined) {
            url = urlMatches[1];
            const urlTxtEx = /\[([^)]+)\]/g;
            const urlTxtMatches = urlTxtEx.exec(mkLink);
            if (urlTxtMatches !== null && urlTxtMatches[1] !== undefined) {
              urlTxt = urlTxtMatches[1];
            }
          }
          if (
            url !== '' &&
            urlTxt !== '' &&
            url.includes(importConfig.linkReplace) &&
            filteredLinks.find(f => f.src === url) === undefined
          ) {
            const ticketNb: string = url.replace(importConfig.linkReplace, '');
            const githubIssue = issues.find(li =>
              li.title.includes(ticketNb + ' - '),
            );
            if (githubIssue === undefined) {
              if (notFound.find(l => l.issueKey === ticketNb) === undefined) {
                notFound.push({
                  issueKey: i.title,
                  linkedIssue: ticketNb,
                });
              }
            } else {
              // If key is present in ticket number, assumption is that this is actually the link to the jira issue, which we want to keep
              if (
                !i.title.includes(ticketNb) &&
                filteredLinks.find((l: any) => l.src === url) === undefined
              ) {
                filteredLinks.push({
                  src: url,
                  srcName: urlTxt,
                  dst: githubIssue.url,
                });
              }
            }
          }
        }
      }
      if (filteredLinks.length > 0) {
        let data: any = {}; // eslint-disable-line

        cpt++;
        if (cpt === 100) {
          try {
            data = await gClient.query({
              query: GQL_RATELIMIT,
              fetchPolicy: 'no-cache',
              errorPolicy: 'ignore',
            });
          } catch (error) {
            console.log(JSON.stringify(GQL_RATELIMIT));
            console.log('THIS IS AN ERROR');
            this.log(error);
          }
          if (data.data.rateLimit !== undefined) {
            this.log(
              'GitHub Tokens - remaining: ' +
                data.data.rateLimit.remaining +
                ' query cost: ' +
                data.data.rateLimit.cost +
                ' (token will reset at: ' +
                data.data.rateLimit.resetAt +
                ')',
            );
            await checkRateLimit(data.data.rateLimit);
          } else {
            this.exit();
          }
          cpt = 0;
        }
        cli.action.start(
          cpt +
            ' - Processing links (' +
            filteredLinks.length +
            ') for issue: ' +
            i.title +
            ' - ' +
            i.url,
        );
        let updatedBody = i.body;
        for (const link of filteredLinks.filter(l => l.srcName !== 'JIRA')) {
          updatedBody = updatedBody.replace(
            '(' + link.src + ')',
            '(' + link.dst + ') *[[JIRA](' + link.src + ')]*',
          );
        }

        try {
          data = await gClient.query({
            query: GQL_UPDATEISSUEBODY,
            variables: { issueId: i.id, issueBody: updatedBody },
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
          });
        } catch (error) {
          console.log(JSON.stringify(GQL_UPDATEISSUEBODY));
          console.log('THIS IS AN ERROR');
          this.log(error);
        }
        await sleep(250);

        if (
          data.data !== undefined &&
          data.data.errors !== undefined &&
          data.data.errors.length > 0
        ) {
          data.data.errors.forEach((error: { message: string }) => {
            this.log(error.message);
          });
        }
        cli.action.stop('done');
      }
    }
  }
}
