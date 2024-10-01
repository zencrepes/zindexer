export interface JiraUser {
  name: string;
  key: string;
  emailAddress: string;
  displayName: string;
}

export interface GitHubUser {
  username: string;
}

export interface User {
  jira: JiraUser;
  github: GitHubUser;
}

export interface Repo {
  jiraProjectKey: string;
  githubOrgRepo: string;
  archive?: {
    date: string;
    field: string;
    githubOrgRepo: string;
  };
}

export interface Label {
  from: string;
  to: string;
}

export interface ImportConfig {
  users: User[];
  repos: Repo[];
  labels: Label[];
  linkReplace: string;
}

export default ImportConfig;
