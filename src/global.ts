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
