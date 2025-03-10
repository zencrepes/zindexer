import { flags } from '@oclif/command';
import cli from 'cli-ux';
import loadYamlFile from 'load-yaml-file';
import * as path from 'path';
import axios from 'axios';
import sqlite3 from 'sqlite3';
import fs, { createWriteStream } from 'fs';

import Command from '../../base';
import esClient from '../../utils/es/esClient';

import fetchAllIssues from '../../utils/import/fetchAllIssues';
import checkConfig from '../../utils/import/checkConfig';

import checkRateLimit from '../../utils/github/utils/checkRateLimit';

import sleep from '../../utils/misc/sleep';

import { ImportConfig } from '../../utils/import/importConfig.type';

// There might be a need to rename some labels due to some conflict with the data in GitHub
const renameLabels = (labels: string[], importConfig: ImportConfig) => {
  const updatedLabels = labels.map(l => {
    const replaceLabel = importConfig.labels.find(r => r.from === l);
    if (replaceLabel !== undefined) {
      return replaceLabel.to;
    }
    // We don't want leading or trailing spaces in labels
    return l.trim();
  });
  return updatedLabels.filter(
    (item, idx) => updatedLabels.indexOf(item) === idx,
  );
};

const importIssues = async (
  eClient: any,
  importIndex: string,
  submitIssues: any[],
  userConfig: any,
  importConfig: any,
) => {
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
  let cpt = 0;
  let retryCpt = 0;
  for (const issue of submitIssues) {
    let response: any = {};
    while ((response === undefined || response.data === undefined) && retryCpt < 5) {
      try {
        response = await axios({
          method: 'post',
          url: 'https://api.github.com/repos/' + issue.repo + '/import/issues',
          headers: {
            Authorization: 'token ' + userConfig.github.token,
            Accept: 'application/vnd.github.golden-comet-preview+json',
          },
          data: issue.payload,
        });
      } catch (error) {
        console.log(error);
        console.log('Error pushing issue: ' + issue.source.key);
      }
      if (response.data !== undefined) {
        retryCpt = 0;
      } else {
        console.log('Error while pushing data to GitHub, retrying in 2s');
        await sleep(2000);        
        retryCpt++;
      }
    }
    const remainingTokens = response.headers['x-ratelimit-remaining'];

    console.log(
      '(' +
        cpt +
        '/' +
        submitIssues.length +
        ') Issue: ' +
        issue.id +
        ' Submitted to GitHub - remaining tokens: ' +
        remainingTokens +
        ' status: ' +
        response.data.status +
        ' (id: ' +
        response.data.id +
        ', resetAt: ' + response.headers['x-ratelimit-reset'] + ')',
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
    await checkRateLimit(response.headers['x-ratelimit-reset'], response.headers['x-ratelimit-remaining'], 5);
    cpt++;
  }
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
      options: ['submit', 'check', 'resubmit', 'crosscheck', 'build-linkdb', 'compare'],
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
    const issuesIndex = userConfig.elasticsearch.dataIndices.githubIssues;
    const issues: any[] = await fetchAllIssues(eClient, importIndex);
    this.log(
      'Loading issues to be submitted to GitHub into memory: ' + issues.length,
    );

    // Step 2: Submitting the payload to GitHub, but only for issues with an empty status
    if (action === 'submit' || action === 'resubmit') {
      let submitIssues = issues.filter(i => i.status === null);
      if (action === 'resubmit') {
        const githubIssues: any[] = await fetchAllIssues(eClient, issuesIndex);
        cli.action.stop('... done (' + githubIssues.length + ' issues currently in GitHub)');        
        submitIssues = issues.filter(
          i =>
            githubIssues.find(gi => gi.title.includes(i.source.key + ' - ')) ===
            undefined,
        );
      }
      this.log('Found: ' + submitIssues.length + ' issues to be (re)submitted');

      await importIssues(
        eClient,
        importIndex,
        submitIssues,
        userConfig,
        importConfig,
      );
    } else if (action === 'compare') {
      // Compare GitHub issues to Jira issues
      // Goal is to identify which issues are missing from GitHub
      const githubIssues: any[] = await fetchAllIssues(eClient, issuesIndex);
      this.log(`Total number of issues in GitHub: ${githubIssues.length}`);

      const jiraIssuesIndex = userConfig.elasticsearch.dataIndices.jiraIssues;
      const jiraIssues: any[] = await fetchAllIssues(eClient, jiraIssuesIndex);
      this.log(`Total number of issues in Jira: ${jiraIssues.length}`);

      const jiraIssuesAbsentFromImportIndex = jiraIssues.filter(
        i =>
          issues.find(gi => gi.id === i.key) ===
          undefined,
      );
      this.log(`The following issues are present in Jira but absent from the import index: ${JSON.stringify(jiraIssuesAbsentFromImportIndex.map((i: any) => i.key))}`);

      const jiraIssuesAbsentFromGitHub = jiraIssues.filter(
        i =>
          githubIssues.find(gi => gi.title.includes(i.key + ' - ')) ===
          undefined,
      );
      this.log(`The following issues are present in Jira but absent from GitHub: ${JSON.stringify(jiraIssuesAbsentFromGitHub.map((i: any) => i.key))}`);

    } else if (action === 'check') {
      // Checking issues that have been submitted to GitHub
      // These are the issues that have a status different from null
      // and that are not present in github already
      this.log('Make sure to grab all issues from github before performing the check. You can do so using the github:issues command');
      const githubIssues: any[] = await fetchAllIssues(eClient, issuesIndex);

      this.log(`Total number of issues to be imported: ${issues.length}`);
      this.log(`Total number of issues in GitHub: ${githubIssues.length}`);
      const absentIssues = issues.filter(
        i =>
          githubIssues.find(gi => gi.title.includes(i.source.key + ' - ')) ===
          undefined,
      );
      this.log(`Total number of issues absent from GitHub: ${absentIssues.length}`);

      const issuesSubmitted = issues.filter(i => i.status !== null);
      this.log(`Total number of issues submitted to GitHub: ${issuesSubmitted.length}`);

      const issuesNotSubmitted = issues.filter(i => i.status === null);
      this.log(`Total number of issues still to be submitted to GitHub (never submitted): ${issuesNotSubmitted.length}`);

      const issuesSubmittedButMissing = absentIssues.filter(
        i =>
          i.status !== null &&
          i.status.status !== undefined &&
          i.status.status !== 'imported',
      );
      this.log(`Total number of issues submitted but missing from GitHub (likely with an error): ${issuesSubmittedButMissing.length}`);

      this.log('Going through the list of missing issues and checking their status from github');
      for (const i of issuesSubmittedButMissing) {
        cli.action.start('Checking issue: ' + i.source.key);
        let response: any = {};
        try {
          response = await axios({
            method: 'get',
            url: i.status.url,
            headers: {
              Authorization: 'token ' + userConfig.github.token,
              Accept: 'application/vnd.github.golden-comet-preview+json',
            },
          });
        } catch (error) {
          console.log(error)
        }
        if (response.data.status === 'failed') {
          cli.action.stop('failed to import');          
          console.log(response.data.errors);
        } else if (response.data.status === 'imported') {
          cli.action.stop('was imported, updating import index');
          const updateIssue = {
            ...i,
            status: response.data,
          };
          await eClient.update({
            id: updateIssue.id,
            index: importIndex,
            body: { doc: updateIssue },
          });          
        } else {
          console.log(response.data)
        }
        await sleep(250);
        await checkRateLimit(response.headers['x-ratelimit-reset'], response.headers['x-ratelimit-remaining'], 5);
      }

      this.log(
        'Remember that labels must be unique per repository, no matter the case',
      );
      this.log('For example, there can only be Bug OR bug');
      this.log(
        'Labels must be less than 50 characters long',
      );             
      this.log(
        'Update the labels config in import-config.yml to automatically update labels before push',
      );

      // const repos: string[] = [];
      // for (const issue of checkIssues) {
      //   if (!repos.includes(issue.status.repository_url)) {
      //     repos.push(issue.status.repository_url);
      //   }
      // }
      // for (const repo of repos) {
      //   let response: any = {};
      //   cli.action.start('Grabbing import status for repo: ' + repo);
      //   try {
      //     response = await axios({
      //       method: 'get',
      //       url: repo + '/import/issues?since=2024-09-28',
      //       headers: {
      //         Authorization: 'token ' + userConfig.github.token,
      //         Accept: 'application/vnd.github.golden-comet-preview+json',
      //       },
      //     });
      //   } catch (error) {
      //     this.log(error);
      //   }
      //   cli.action.stop(' done (grabbed: ' + response.data.length + ')');

      //   const failedLabels: string[] = [];
      //   for (const importStatus of response.data) {
      //     const importIssue = issues.filter(i => i.status !== undefined && i.status !== null).find(i => i.status.id === importStatus.id);
      //     if (importIssue !== undefined) {
      //       const updateIssue = {
      //         ...importIssue,
      //         status: importStatus,
      //       };
      //       await eClient.update({
      //         id: updateIssue.id,
      //         index: importIndex,
      //         body: { doc: updateIssue },
      //       });
      //       if (importStatus.status === 'failed') {
      //         for (const error of importStatus.errors) {
      //           this.log('Unable to import issue: ' + importIssue.source.key + ' Error: ' + JSON.stringify(error));
      //           if (error.resource === 'Label') {
      //             if (!failedLabels.includes(error.value)) {
      //               failedLabels.push(error.value);
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      //   await sleep(250);
      //   await checkRateLimit(response.headers['x-ratelimit-reset'], response.headers['x-ratelimit-remaining'], 5);
      //   if (failedLabels.length > 0) {
      //     this.log('The following labels could not be pushed to GitHub');
      //     this.log(
      //       'Remember that labels must be unique per repository, no matter the case',
      //     );
      //     this.log('For example, there can only be Bug OR bug');
      //     this.log(
      //       'Labels must be less than 50 characters long',
      //     );             
      //     this.log(
      //       'Update the labels config in import-config.yml to automatically update labels before push',
      //     );
      //     for (const flabel of failedLabels) {
      //       this.log('Label: ' + flabel);
      //     }
      //   }
      // }
    } else if (action === 'crosscheck') {
      // Compares issues in the github index to issues in the import index to find which ones are missing
      const githubIssues: any[] = await fetchAllIssues(eClient, issuesIndex);
      cli.action.stop('... done (' + githubIssues.length + ' issues)');

      const missingIssues = issues.filter(
        i =>
          githubIssues.find(gi => gi.title.includes(i.source.key + ' - ')) ===
          undefined,
      );
      this.log('Found: ' + missingIssues.length + ' issues missing');
      this.log(
        'Fetching errors for first 20 missing issues (problems are often similar between issues)',
      );
      for (const mi of missingIssues.slice(0, 20)) {
        cli.action.start('Fetching status for missing issue: ' + mi.source.key);
        let response: any = {};
        try {
          response = await axios({
            method: 'get',
            url: mi.status.url,
            headers: {
              Authorization: 'token ' + userConfig.github.token,
              Accept: 'application/vnd.github.golden-comet-preview+json',
            },
          });
        } catch (error) {
          this.log(error);
        }
        cli.action.stop('... done');
        this.log(response.data.errors);
        this.log(response.data);

        const updatedIssue = {
          ...mi,
          status: response.data,
        };
        await eClient.update({
          id: updatedIssue.id,
          index: importIndex,
          body: { doc: updatedIssue },
        });        
      }

      // Update the import index with status of issues that were iomported properly (not to check them again next time)
   
      // await importIssues(
      //   eClient,
      //   importIndex,
      //   missingIssues,
      //   userConfig,
      //   importConfig,
      // );
    } else if (action === 'build-linkdb') {
      // This action builds a sqlite db containing the source key and corresponding GitHub issue URL
      // It can later be used to build a mechanism to generate a redirection from Jira URLs to GitHub URLs
      const githubIssues: any[] = await fetchAllIssues(eClient, issuesIndex);
      cli.action.stop('... done (' + githubIssues.length + ' issues)');

      const databaseFilepath = path.join(this.config.configDir, 'jira-export.db');
      if (fs.existsSync(databaseFilepath)) {
        fs.unlinkSync(databaseFilepath);
        this.log(`Deleted existing database file: ${databaseFilepath}`);
      } 

      const rewritemapFilepath = path.join(this.config.configDir, 'jira-export-rewritemap.txt');
      if (fs.existsSync(rewritemapFilepath)) {
        fs.unlinkSync(rewritemapFilepath);
        this.log(`Deleted existing rewrite map file: ${rewritemapFilepath}`);
      } 

      const rewritemapStream = createWriteStream(rewritemapFilepath,{ flags: 'a' });
      // Create empty database
      const db = new sqlite3.Database(databaseFilepath, (err) => {
        if (err) {
            console.log("Getting error " + err);
            this.exit(1);
        }
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS issues (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          jira_key TEXT,
          jira_url TEXT,
          github_id TEXT,
          github_url TEXT
        )
      `);

      // Loop through all issues 
      for (const i of issues) {        
        const matchGitHubIssue = githubIssues.find(gi => gi.title.includes(i.source.key + ' - '))
        if (matchGitHubIssue !== undefined) {
          await db.run('INSERT INTO issues (jira_key, jira_url, github_id, github_url) VALUES (?, ?, ?, ?)', [i.source.key, i.source.url, matchGitHubIssue.id, matchGitHubIssue.url]);

          rewritemapStream.write(`${i.source.key} ${matchGitHubIssue.url} \n`);
        } 
      }
      this.log(`Finished populating the database: ${databaseFilepath}`);

      rewritemapStream.end();
      this.log(`Finished populating the rewritemap: ${rewritemapFilepath}`);



    }
    // Need to add some logic to retry until all issues have the status updated
  }
}
