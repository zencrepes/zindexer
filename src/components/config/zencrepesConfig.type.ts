export interface ConfigElasticsearch {
  host: string;
  sslCa: string;
  cloudId: string;
  username: string;
  password: string;
  sysIndices: {
    sources: string;
    datasets: string;
    config: string;
  };
  oneIndexPerSource: boolean;
  dataIndices: {
    githubRepos: string;
    githubIssues: string;
    githubPullrequests: string;
    githubVulnerabilities: string;
    githubStargazers: string;
    githubWatchers: string;
    githubProjects: string;
    githubMilestones: string;
    githubLabels: string;
    githubReleases: string;
    jiraIssues: string;
    jiraProjects: string;
    circleciPipelines: string;
    circleciEnvvars: string;
    circleciInsights: string;
  };
}

export interface ConfigGithubPointsLabels {
  label: string;
  points: number;
}

export interface GithubWebhookEvents {
  githubEvent: string;
  zencrepesEntity: string;
}

export interface ConfigGithub {
  enabled: boolean;
  username: string;
  token: string;
  fetch: {
    maxNodes: number;
  };
  storyPointsLabels: ConfigGithubPointsLabels[];
  webhook: {
    secret: string;
    events: GithubWebhookEvents[];
    timelinePayload: {
      includeGithubEvents: string[];
      excludeGithubEvents: string[];
      esIndexPrefix: string;
    };
    nodePayload: {
      includeGithubEvents: string[];
      excludeGithubEvents: string[];
      esIndexPrefix: string;
    };
    fetchNode: {
      includeGithubEvents: string[];
      excludeGithubEvents: string[];
    };
  };
}
export interface ConfigJiraFieldMapping {
  jfield: string;
  zfield: string;
}

export interface ConfigCircleci {
  enabled: boolean;
  token: string;
}

export interface ConfigJira {
  name: string;
  enabled: boolean;
  config: {
    host: string;
    username: string;
    password: string;
    fields: {
      issues: Array<ConfigJiraFieldMapping>;
    };
    excludeDays: Array<string>;
    fetch: {
      maxNodes: number;
    };
  };
}

export interface Config {
  elasticsearch: ConfigElasticsearch;
  github: ConfigGithub;
  circleci: ConfigCircleci;
  jira: Array<ConfigJira>;
}

export default Config;
