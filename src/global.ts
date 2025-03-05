export {
  Config,
  ConfigJira,
  ConfigBamboo,
  ConfigCircleci,
  ConfigJiraFieldMapping,
  ConfigGithub,
  ConfigGithubPointsLabels,
  ConfigElasticsearch,
} from './components/config/zencrepesConfig.type';

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

interface TimelineProject {
  title: string; 
  id: string
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

export interface BambooResponsePlan {
  expand: string;
  self: string;
  id: string;
  key: string;
  name: string;
}

export interface ESSearchResponse<T> {
  hits: {
    tital: { value: number };
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
  project?: string;
  plan?: string;
  active: boolean;
  remoteLinks?: boolean;
  repository?: GithubRepository;
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

export interface BambooPlan {
  id: string;
  key: string;
}

export interface BambooRun {
  id: string;
  key: string;
  number: number;
  startedAt: string;
}

export interface GithubOrganization {
  login: string;
  id: string;
  url?: string;
  name?: string;
  __typename?: string;
}

export interface GithubRepository {
  name: string;
  id: string;
  url?: string;
  owner: GithubOrganization;
  active?: boolean;
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
