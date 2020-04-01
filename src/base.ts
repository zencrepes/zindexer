import Command, { flags } from '@oclif/command';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import { Config } from './global';

export default abstract class extends Command {
  static flags = {
    // eslint-disable-next-line
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
  };

  userConfig = {
    elasticsearch: {
      host: 'http://127.0.0.1:9200',
      sslCa: '',
      cloudId: '',
      username: '',
      password: '',
      sysIndices: {
        sources: 'sources', // this index is used to store sources data
        datasets: 'datasets', // this index is used to store data about available index types
        config: 'config', // this index is used to store zencrepes configuration
      },
      dataIndices: {
        githubRepos: 'gh_repos',
        githubIssues: 'gh_issues_',
        githubPullrequests: 'gh_prs_',
        githubProjects: 'gh_projects_',
        githubMilestones: 'gh_milestones_',
        githubLabels: 'gh_labels_',
        githubReleases: 'gh_releases_',
        jiraIssues: 'j_issues_',
        jiraProjects: 'j_projects_',
        circleciPipelines: 'cci_pipelines_',
        circleciEnvvars: 'cci_envvars_',
        circleciInsightsWorkflowsSummary: 'cci_insights_wfsum_',
        circleciInsightsWorkflowsRuns: 'cci_insights_wfruns_',
        circleciInsightsJobsSummary: 'cci_insights_jobssum_',
        circleciInsightsJobsRuns: 'cci_insights_jobsruns_',
      },
    },
    arranger: {
      project: 'zencrepes',
      admin: {
        graphQLEndpoint: 'http://localhost:5050/admin/graphql',
      },
    },
    github: {
      enabled: true,
      username: 'YOUR_USERNAME',
      token: 'YOUR_TOKEN',
      fetch: {
        maxNodes: 30,
      },
    },
    circleci: {
      enabled: true,
      token: 'YOUR_TOKEN',
    },
    jira: [
      {
        name: 'SERVER_1',
        enabled: true,
        config: {
          username: 'username',
          password: 'password',
          host: 'https://jira.myhost.org',
          fields: {
            points: 'customfield_10114',
            originalPoints: 'customfield_11115',
            parentInitiative: 'customfield_11112',
            parentEpic: 'customfield_10314',
          },
          excludeDays: ['1900-01-01'],
          fetch: {
            maxNodes: 30,
          },
        },
      },
    ],
  };

  setUserConfig(userConfig: Config) {
    this.userConfig = userConfig;
  }

  async init() {
    const { flags } = this.parse();
    // eslint-disable-next-line
    const { envUserConf } = flags;

    if (process.env.CONFIG_DIR !== undefined) {
      this.config.configDir = process.env.CONFIG_DIR;
    }
    // If config file does not exists, initialize it:
    fse.ensureDirSync(this.config.configDir);
    fse.ensureDirSync(this.config.configDir + '/cache/');

    // eslint-disable-next-line
    if (envUserConf !== undefined) {
      this.setUserConfig(JSON.parse(envUserConf));
    } else {
      if (!fs.existsSync(path.join(this.config.configDir, 'config.yml'))) {
        fs.writeFileSync(
          path.join(this.config.configDir, 'config.yml'),
          jsYaml.safeDump(this.userConfig),
        );
        this.log(
          'Initialized configuration file with defaults in: ' +
            path.join(this.config.configDir, 'config.yml'),
        );
        this.log('Please EDIT the configuration file first');
        this.exit();
      } else {
        this.log(
          'Configuration file exists: ' +
            path.join(this.config.configDir, 'config.yml'),
        );

        const userConfig = await loadYamlFile(
          path.join(this.config.configDir, 'config.yml'),
        );
        this.setUserConfig(userConfig);
        //console.log(this.userConfig);
      }
    }
  }
}
