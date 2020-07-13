export interface User {
  jiraEmail: string;
  githubUsername: string;
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
