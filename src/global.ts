interface ConfigElasticsearch {
  port: number;
  host: string;
  indices: {
    repos: string;
    issues: string;
    projects: string;
    labels: string;
    milestones: string;
    prs: string;
  };
}
interface ConfigGithub {
  enabled: boolean;
  username: string;
  token: string;
  fetch: {
    maxNodes: number;
  };
}
interface ConfigJira {
  name: string;
  enabled: boolean;
  config: {
    host: string;
    username: string;
    password: string;
    fields: {
      points: string;
      originalPoints: string;
      parentInitiative: string;
      parentEpic: string;
    };
    excludeDays: Array<string>;
  };
}
export interface Config {
  elasticsearch: ConfigElasticsearch;
  github: ConfigGithub;
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
    data: any;
  };
}
