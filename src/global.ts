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
    circleciInsightsWorkflowsSummary: string;
    circleciInsightsWorkflowsRuns: string;
    circleciInsightsJobsSummary: string;
    circleciInsightsJobsRuns: string;
  };
}

export interface ConfigGithub {
  enabled: boolean;
  username: string;
  token: string;
  fetch: {
    maxNodes: number;
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

interface User {
  username: string;
  fullname: string;
  url?: string;
  avatarUrl?: string;
}

interface Label {
  name: string;
  color: string;
}

// This interface aims at abstracting an issue at a level compatible across all ticketing systems
export interface Issue {
  createdAt: Date;
  updatedAt: Date;
  // In the absence of closed date in the source ticket schema, if the state of the issue is closed, closedAt will become the last time the issue was updated
  closedAt: Date;
  title: string;
  description: string;
  url: string;
  states: 'OPEN' | 'IN-PROGRESS' | 'CLOSED';
  assignee: Array<User>;
  author: User;
  labels: Array<Label>;
  source: {
    type: 'JIRA' | 'GITHUB';
    data: any; // eslint-disable-line
  };
}

// Single project data when getting list of projects from Jira
export interface JiraResponseProject {
  expand: string;
  self: string;
  id: string;
  key: string;
  name: string;
  avatarUrls: {};
  projectCategory: {
    self: string;
    id: string;
    name: string;
    description: string;
  };
  projectTypeLey: string;
}

export interface ESSearchResponse<T> {
  hits: {
    hits: Array<{
      _source: T;
    }>;
  };
}

export interface ESIndexSources {
  uuid: string;
  id: string;
  type: string;
  server?: string;
  name: string;
  active: boolean;
}

// Object containing all of Jira data related to a project
export interface JiraProject {
  id: string;
  properties: any; // eslint-disable-line
  roles: any; // eslint-disable-line
  issueScheme: any; // eslint-disable-line
  notificationsScheme: any; // eslint-disable-line
  permissionsScheme: any; // eslint-disable-line
  priorityScheme: any; // eslint-disable-line
  securityLevel: any; // eslint-disable-line
}

export interface JiraIssue {
  id: string;
  key: string;
  updatedAt: string;
}

export interface GithubOrganization {
  login: string;
  id: string;
  name?: string;
  __typename?: string;
}

export interface GithubRepository {
  name: string;
  id: string;
  owner: GithubOrganization;
  active: boolean;
}

export interface GithubIssue {
  id: string;
}
export interface GithubPullrequest {
  id: string;
  updatedAt: string;
}
// Standard Github node interface
export interface GithubNode {
  id: string;
  updatedAt: string;
}
