import { flags } from '@oclif/command';
import cli from 'cli-ux';
import loadYamlFile from 'load-yaml-file';
import * as path from 'path';
import * as fs from 'fs';
import * as jsYaml from 'js-yaml';

import Command from '../../base';
import esClient from '../../utils/es/esClient';

import jira2md from 'jira2md';

import fetchAllIssues from '../../utils/import/fetchAllIssues';
import checkConfig from '../../utils/import/checkConfig';
import getHeader from '../../utils/import/getHeader';
import getComments from '../../utils/import/getComments';
import getAssignee from '../../utils/import/getAssignee';
import getReporter from '../../utils/import/getReporter';
import getLabels from '../../utils/import/getLabels';

import { esMapping, esSettings } from '../../components/githubImport';

import { checkEsIndex, pushEsNodes } from '../../components/esUtils/index';

import { ImportConfig } from '../../utils/import/importConfig.type';
import { GithubIssue } from 'src/global';

//https://gist.github.com/jonmagic/5282384165e0f86ef105
export default class Issues extends Command {
  static description = 'Jira: Prepare Jira issues for export to GitHub';

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

    this.log('==================================================');
    this.log('Before using this command, please make sure that: ');
    this.log(' - Your Jira Issues are already imported (zindexer jira:issues');
    this.log(
      ' - Import configuration file was filled (in particular user matching)',
    );
    this.log('==================================================');

    await checkConfig(this.config, this.log);
    const importConfig: ImportConfig = await loadYamlFile(
      path.join(this.config.configDir, 'import-config.yml'),
    );

    // Step 1: Importing all issues in memory
    const issuesIndex = userConfig.elasticsearch.dataIndices.jiraIssues;
    const issues: GithubIssue[] = await fetchAllIssues(
      eClient,
      issuesIndex,
      500,
    );
    this.log('Number of issues fetched into memory: ' + issues.length);

    // Step 2: Verifying that all users have a matching github username (creator, assignee, comments).
    cli.action.start(
      'Verifying that all users (creator, reporter, assignee) are present in import config',
    );

    const userUniqueEmails: string[] = [];
    for (const i of issues.filter(i => i.key !== undefined)) {
      // Reporter
      if (i.reporter !== undefined && i.reporter !== null) {
        if (!userUniqueEmails.includes(i.reporter.emailAddress)) {
          userUniqueEmails.push(i.reporter.emailAddress);
        }
      }
      if (i.creator !== undefined && i.creator !== null) {
        if (!userUniqueEmails.includes(i.creator.emailAddress)) {
          userUniqueEmails.push(i.creator.emailAddress);
        }
      }
      if (i.assignee !== undefined && i.assignee !== null) {
        if (!userUniqueEmails.includes(i.assignee.emailAddress)) {
          userUniqueEmails.push(i.assignee.emailAddress);
        }
      }
      if (i.comments !== undefined && i.comments.totalCount > 0) {
        for (const comment of i.comments.edges) {
          if (!userUniqueEmails.includes(comment.node.author.emailAddress)) {
            userUniqueEmails.push(comment.node.author.emailAddress);
          }
          if (
            !userUniqueEmails.includes(comment.node.updateAuthor.emailAddress)
          ) {
            userUniqueEmails.push(comment.node.updateAuthor.emailAddress);
          }
        }
      }
      if (
        importConfig.repos.find(r => r.jiraProjectKey === i.project.key) ===
        undefined
      ) {
        this.log(
          'Error, could not find a matching GitHub repository for Jira Project key: ' +
            i.project.key,
        );
        this.exit();
      }
    }
    const missingEmails: string[] = userUniqueEmails.filter(
      u => importConfig.users.find(us => us.jiraEmail === u) === undefined,
    );
    if (missingEmails.length > 0) {
      this.log('The following users are missing from import-config.yml:');
      missingEmails.forEach(m => this.log(m));
      const formatMissing = {
        users: missingEmails.map((m: string) => {
          return { jiraEmail: m, githubUsername: 'TOBEREPLACED' };
        }),
      };
      fs.writeFileSync(
        path.join(this.config.configDir, 'import-config.template.yml'),
        jsYaml.safeDump(formatMissing),
      );
      this.log(
        'A template was prepopulated at: ' +
          path.join(this.config.configDir, 'import-config.template.yml'),
      );
      this.log(
        'The importer will now EXIT, please edit: ' +
          path.join(this.config.configDir, 'import-config.yml'),
      );
      this.exit();
    }
    cli.action.stop(' done');

    // Step 3: Going throught the issue one by one to "prep" them
    // The prep stage dump the payload "as it would be submitted" to an Elasticsearch index
    /*
    {
      "issue": {
        "title": "Imported from some other system",
        "body": "...",
        "created_at": "2014-01-01T12:34:58Z",
        "closed_at": "2014-01-02T12:24:56Z",
        "updated_at": "2014-01-03T11:34:53Z",
        "assignee": "jonmagic",
        "milestone": 1,
        "closed": true,
        "labels": [
          "bug",
          "low"
        ]
      },
      "comments": [
        {
          "created_at": "2014-01-02T12:34:56Z",
          "body": "talk talk"
        }
      ]
    }
    */

    this.log('Creating import elements before populating in Elasticsearch');

    const preppedIssues: any[] = [];
    //.filter(i => i.key === 'FORM-1585')
    for (let i of issues.filter(i => i.key !== undefined)) {
      const repoCfg: any = importConfig.repos.find(
        r => r.jiraProjectKey === i.project.key,
      );
      // If there is an issue in the parentEpic field, this issue get added to the object
      if (i.parentEpic !== null && i.parent === undefined) {
        const parentEpic = issues.find(p => p.key === i.parentEpic);
        if (parentEpic !== undefined) {
          i = { ...i, parent: parentEpic };
        }
      }
      // If issue is an epic, its children get added to the object
      if (i.type.name === 'Epic') {
        i = { ...i, epicChildren: issues.filter(c => c.parentEpic === i.key) };
      }
      if (i.type.name === 'Initiative') {
        i = {
          ...i,
          initiativeChildren: issues.filter(c => c.parentInitiative === i.key),
        };
      }

      const header = getHeader(i, importConfig.users);
      const comments = getComments(i, importConfig.users);
      const assignee = getAssignee(i, importConfig.users);
      const reporter = getReporter(i, importConfig.users);
      const labels = getLabels(i);
      let body =
        i.description !== null
          ? header + '\n\n\n' + jira2md.to_markdown(i.description)
          : header;

      const bodySize = new TextEncoder().encode(body).length;
      if (bodySize > 250000) {
        this.log(i.key + ': Large issue found, trimming everything past 250kb');
        body =
          body.slice(0, 250000) +
          '\n\n\n ** Body was too large and was trimmed, refer to the source issue for full content';
      }

      let issuePayload: any = {
        title: i.key + ' - ' + i.summary,
        body,
        closed: i.status.statusCategory.key !== 'done' ? false : true,
        // eslint-disable-next-line @typescript-eslint/camelcase
        created_at: new Date(i.createdAt).toISOString(),
        // eslint-disable-next-line @typescript-eslint/camelcase
        updated_at: new Date(i.updatedAt).toISOString(),
      };
      if (assignee !== null) {
        issuePayload = { ...issuePayload, assignee };
      } else {
        issuePayload = { ...issuePayload, assignee: reporter };
      }
      if (i.closedAt !== null) {
        issuePayload = {
          ...issuePayload,
          // eslint-disable-next-line @typescript-eslint/camelcase
          closed_at: new Date(i.closedAt).toISOString(),
        };
      }
      if (labels.length > 0) {
        issuePayload = { ...issuePayload, labels };
      }

      const pIssue: any = {
        id: i.key,
        createdAt: new Date().toISOString(),
        source: i,
        payload: {
          issue: issuePayload,
          comments,
        },
        repo: repoCfg.githubOrgRepo,
        status: null,
      };

      preppedIssues.push(pIssue);
    }

    // To prevent erasing data by mistake, checking with data already in the import project
    const importIndex = userConfig.elasticsearch.dataIndices.githubImport;
    await checkEsIndex(eClient, importIndex, esMapping, esSettings, this.log);

    this.log(
      'Comparing import elements with the ones already submitted to Elasticsearch',
    );

    const alreadyPrepped: any[] = await fetchAllIssues(
      eClient,
      importIndex,
      500,
    );

    const filteredIssues = preppedIssues.filter(
      i => alreadyPrepped.find(ip => ip.key === i.key) === undefined,
    );

    // Push to elasticsearch
    this.log(
      'Submitting data to Elasticsearch for import (using github:import)',
    );
    await pushEsNodes(eClient, importIndex, filteredIssues, this.log);
  }
}
