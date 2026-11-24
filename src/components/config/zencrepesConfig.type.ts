export interface ConfigElasticsearch {
  // The search engine behind the config: elasticsearch (default) or
  // opensearch. zqueue v2 supports both; zindexer talks to Elasticsearch.
  engine?: 'elasticsearch' | 'opensearch';
  host: string;
  sslCa: string;
  // Set to false to accept a self-signed certificate.
  sslVerify?: boolean;
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
    githubImport: string;
    githubMavenPoms: string;
    githubCopilotmetrics: string;
    jiraIssues: string;
    jiraProjects: string;
    circleciPipelines: string;
    circleciEnvvars: string;
    circleciInsights: string;
    testingStates: string;
    testingRuns: string;
    testingCases: string;
    testingPerfs: string;
    bambooRuns: string;
  };
}

export interface ConfigRedis {
  host: string;
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
    maxParallel: number;
    delayBetweenCalls: number;
  };
  storyPointsLabels: ConfigGithubPointsLabels[];
  webhook: {
    secret: string;
    // zqueue v2: filter and target of the event recording
    includeGithubEvents?: string[];
    excludeGithubEvents?: string[];
    esIndexPrefix?: string;
    // zqueue v1 keys, still read by utils:github-project-cards
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
  cardEvents: {
    localPath: string;
  };
  copilotApi: {
    fetchMonths: number;
    fetchWindow: number;
  };
}

export interface ConfigTesting {
  webhook: {
    secret: string;
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
    concurrency: number;
    fields: {
      issues: Array<ConfigJiraFieldMapping>;
    };
    excludeDays: Array<string>;
    fetch: {
      maxNodes: number;
    };
    attachments: {
      localPath: string;
      remoteHost: string;
    };
  };
}

export interface ConfigBamboo {
  name: string;
  enabled: boolean;
  config: {
    host: string;
    username: string;
    password: string;
    concurrency: number;
    fetch: {
      maxNodes: number;
    };
  };
}

export interface ConfigAuthDomainCheck {
  enabled: boolean;
  warning: string;
  domains: string[];
}

export interface ConfigAuth {
  domainCheck: ConfigAuthDomainCheck;
}

export interface Config {
  auth: ConfigAuth;
  elasticsearch: ConfigElasticsearch;
  redis: ConfigRedis;
  github: ConfigGithub;
  circleci: ConfigCircleci;
  jira: Array<ConfigJira>;
  bamboo: Array<ConfigBamboo>;
  testing: ConfigTesting;
}

export default Config;
