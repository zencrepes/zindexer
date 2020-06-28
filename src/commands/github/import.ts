import { flags } from '@oclif/command';
import cli from 'cli-ux';
import loadYamlFile from 'load-yaml-file';
import * as path from 'path';
import axios from 'axios';

import Command from '../../base';
import esClient from '../../utils/es/esClient';

import fetchAllIssues from '../../utils/import/fetchAllIssues';
import checkConfig from '../../utils/import/checkConfig';

import { ImportConfig } from '../../utils/import/importConfig.type';
import { GithubIssue } from 'src/global';

const sleep = (ms: number) => {
  //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
  // tslint:disable-next-line no-string-based-set-timeout
  return new Promise(resolve => setTimeout(resolve, ms));
};

const checkRateLimit = async (response: any) => {
  const resetAt = response.headers['x-ratelimit-reset'];
  const remainingTokens = response.headers['x-ratelimit-remaining'];
  if (remainingTokens <= 5 && resetAt !== null) {
    console.log(
      new Date().toISOString() +
        ': Exhausted all available tokens, will resuming querying after ' +
        new Date(resetAt * 1000),
    );
    const sleepDuration =
      new Date(resetAt * 1000).getTime() - new Date().getTime();
    console.log(
      new Date().toISOString() +
        ': Will resume querying in: ' +
        sleepDuration +
        's',
    );
    await sleep(sleepDuration + 10000);
    console.log(new Date().toISOString() + ': Ready to resume querying');
  }
};

// There might be a need to rename some labels due to some conflict with the data in GitHub
// For
const renameLabels = (labels: string[], importConfig: ImportConfig) => {
  return labels.map(l => {
    const replaceLabel = importConfig.labels.find(r => r.from === l);
    if (replaceLabel !== undefined) {
      return replaceLabel.to;
    }
    return l;
  });
};

//https://gist.github.com/jonmagic/5282384165e0f86ef105
export default class Import extends Command {
  static description = 'Github: Imports data to GitHub';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),

    action: flags.string({
      char: 'a',
      options: ['submit', 'check', 'resubmit'],
      required: false,
      default: 'submit',
      description: 'Import action to be performed',
    }),
  };

  async run() {
    const { flags } = this.parse(Import);
    const { action } = flags;

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    await checkConfig(this.config, this.log);
    const importConfig: ImportConfig = await loadYamlFile(
      path.join(this.config.configDir, 'import-config.yml'),
    );

    // Step 1: Importing all issues in memory
    const importIndex = userConfig.elasticsearch.dataIndices.githubImport;
    const issues: GithubIssue[] = await fetchAllIssues(eClient, importIndex);
    this.log(
      'Loading issues to be submitted to GitHubinto memory: ' + issues.length,
    );

    // Step 2: Submitting the payload to GitHub, but only for issues with an empty status
    if (action === 'submit' || action === 'resubmit') {
      let submitIssues = issues.filter(i => i.status === null);
      if (action === 'resubmit') {
        submitIssues = issues.filter(
          i => i.status !== null && i.status.status === 'failed',
        );
      }
      submitIssues = submitIssues.map(i => {
        return {
          ...i,
          payload: {
            ...i.payload,
            issue: {
              ...i.payload.issue,
              labels: renameLabels(i.payload.issue.labels, importConfig),
            },
          },
        };
      });
      for (const issue of submitIssues) {
        let response: any = {};
        try {
          response = await axios({
            method: 'post',
            url:
              'https://api.github.com/repos/' + issue.repo + '/import/issues',
            headers: {
              Authorization: 'token ' + userConfig.github.token,
              Accept: 'application/vnd.github.golden-comet-preview+json',
            },
            data: issue.payload,
          });
        } catch (error) {
          this.log(error);
          this.log('Error pushing issue: ' + issue.source.key);
        }
        const remainingTokens = response.headers['x-ratelimit-remaining'];

        this.log(
          'Issue: ' +
            issue.id +
            ' Submitted to GitHub - remaining tokens: ' +
            remainingTokens +
            ' status: ' +
            response.data.status +
            ' (id: ' +
            response.data.id +
            ')',
        );
        const updatedIssue = {
          ...issue,
          status: response.data,
        };
        await eClient.update({
          id: issue.id,
          index: importIndex,
          body: { doc: updatedIssue },
        });
        await sleep(250);
        await checkRateLimit(response);
      }
    } else if (action === 'check') {
      // Checking issues in GitHub that don't have
      const checkIssues = issues.filter(
        i =>
          i.status !== null &&
          i.status.status !== undefined &&
          i.status.status !== 'imported',
      );
      const repos: string[] = [];
      for (const issue of checkIssues) {
        if (!repos.includes(issue.status.repository_url)) {
          repos.push(issue.status.repository_url);
        }
      }
      for (const repo of repos) {
        let response: any = {};
        cli.action.start('Grabbing import status for repo: ' + repo);
        try {
          response = await axios({
            method: 'get',
            url: repo + '/import/issues?since=2015-03-15',
            headers: {
              Authorization: 'token ' + userConfig.github.token,
              Accept: 'application/vnd.github.golden-comet-preview+json',
            },
          });
        } catch (error) {
          this.log(error);
        }
        cli.action.stop(' done (grabbed: ' + response.data.length + ')');

        const failedLabels: string[] = [];
        for (const importStatus of response.data) {
          const importIssue = issues.find(i => i.status.id === importStatus.id);
          if (importIssue !== undefined) {
            const updateIssue = {
              ...importIssue,
              status: importStatus,
            };
            await eClient.update({
              id: updateIssue.id,
              index: importIndex,
              body: { doc: updateIssue },
            });
            if (importStatus.status === 'failed') {
              for (const error of importStatus.errors) {
                if (error.resource === 'Label') {
                  if (!failedLabels.includes(error.value)) {
                    failedLabels.push(error.value);
                  }
                }
              }
            }
          }
        }
        await sleep(250);
        await checkRateLimit(response);
        if (failedLabels.length > 0) {
          this.log('The following labels could not be pushed to GitHub');
          this.log(
            'Remember that labels must be unique per repository, no matter the case',
          );
          this.log('For example, there can only be Bug OR bug');
          this.log(
            'Update the labels config in import-config.yml to automatically update labels before push',
          );
          for (const flabel of failedLabels) {
            this.log('Label: ' + flabel);
          }
        }
      }
    }
    // Need to add some logic to retry until all issues have the status updated
  }
}
