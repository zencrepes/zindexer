const defaultConfig = {
  auth: {
    domainCheck: {
      enabled: false,
      warning:
        'If enabled, for each call received by the API, the user email will be verified aginst that list of domains. User will be granted if the user email includes a portion of the domain. Do not forget to disable Account login in your Realm configuration.',
      domains: ['@checkingdomain.com123', '@anotherdomain.com456'],
    },
  },
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
    oneIndexPerSource: false,
    dataIndices: {
      githubRepos: 'gh_repos',
      githubIssues: 'gh_issues_',
      githubPullrequests: 'gh_prs_',
      githubVulnerabilities: 'gh_vulns_',
      githubStargazers: 'gh_stargazers_watchers_',
      githubWatchers: 'gh_stargazers_watchers_',
      githubProjects: 'gh_projects_',
      githubMilestones: 'gh_milestones_',
      githubLabels: 'gh_labels_',
      githubReleases: 'gh_releases_',
      githubImport: 'gh_import_',
      jiraIssues: 'j_issues_',
      jiraProjects: 'j_projects_',
      circleciPipelines: 'cci_pipelines_',
      circleciEnvvars: 'cci_envvars_',
      circleciInsights: 'cci_insights_',
      testingStates: 't_states_',
    },
  },
  redis: {
    host: 'redis://localhost:6379',
  },
  github: {
    enabled: true,
    username: 'YOUR_USERNAME',
    token: 'YOUR_TOKEN',
    fetch: {
      maxNodes: 30,
      maxParallel: 1,
      delayBetweenCalls: 1000,
    },
    // Define a match between a points label and numbers
    storyPointsLabels: [
      { label: 'xx-small', points: 1 },
      { label: 'x-small', points: 2 },
      { label: 'small', points: 3 },
      { label: 'medium', points: 5 },
      { label: 'large', points: 8 },
      { label: 'x-large', points: 13 },
    ],
    // The webhook configuration is used by zqueue to determine next course of action
    webhook: {
      secret: 'PLEASE_CHANGE_ME',
      // The Array of events matches and event name with an entity type as processed by ZenCrepes
      // You shouldn't need to change these values
      events: [
        { githubEvent: 'label', zencrepesEntity: 'labels' },
        { githubEvent: 'repository', zencrepesEntity: 'repos' },
        { githubEvent: 'pull_request', zencrepesEntity: 'pullrequests' },
        { githubEvent: 'issues', zencrepesEntity: 'issues' },
        { githubEvent: 'vulnerabilities', zencrepesEntity: 'vulnerabilities' },
        { githubEvent: 'stargazers', zencrepesEntity: 'star' },
        { githubEvent: 'watchers', zencrepesEntity: 'watch' },
        { githubEvent: 'project', zencrepesEntity: 'projects' },
        { githubEvent: 'milestone', zencrepesEntity: 'milestones' },
        { githubEvent: 'release', zencrepesEntity: 'releases' },
      ],
      // Save the raw webhook "as-received" in a timeline fashion (no overwrite)
      timelinePayload: {
        includeGithubEvents: ['*'],
        excludeGithubEvents: ['push', 'create'],
        esIndexPrefix: 'gh_webhook_timeline_',
      },
      // Save the node data contained in the webhook
      // Overwrite previous node state if the same node with same ID is received
      // One index per node type
      nodePayload: {
        includeGithubEvents: ['*'],
        excludeGithubEvents: ['push', 'create'],
        esIndexPrefix: 'gh_webhook_',
      },
      // Execute a call to GitHub to fetch the latest data in the same format than zindexer (using the same GraphQL query)
      // Data is fed into the indices specified in the elasticsearch section
      fetchNode: {
        includeGithubEvents: ['*'],
        excludeGithubEvents: [''],
      },
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
        // Concurrent API calls to JIRA, this is only used for specific "light" calls when bulk fetching is not available at an API level
        // Such as fetching remote links
        concurrency: 20,
        fields: {
          issues: [
            { jfield: 'issueType', zfield: 'issueType' },
            { jfield: 'parent', zfield: 'parent' },
            { jfield: 'project', zfield: 'project' },
            { jfield: 'fixVersions', zfield: 'fixVersions' },
            { jfield: 'resolution', zfield: 'resolution' },
            { jfield: 'resolutiondate', zfield: 'closedAt' },
            { jfield: 'watches', zfield: 'watches' },
            { jfield: 'created', zfield: 'createdAt' },
            { jfield: 'priority', zfield: 'priority' },
            { jfield: 'versions', zfield: 'versions' },
            { jfield: 'issuelinks', zfield: 'links' },
            { jfield: 'issuetype', zfield: 'type' },
            { jfield: 'assignee', zfield: 'assignee' },
            { jfield: 'resolution', zfield: 'resolution' },
            { jfield: 'updated', zfield: 'updatedAt' },
            { jfield: 'status', zfield: 'status' },
            { jfield: 'description', zfield: 'description' },
            { jfield: 'summary', zfield: 'summary' },
            { jfield: 'creator', zfield: 'creator' },
            { jfield: 'subtasks', zfield: 'subtasks' },
            { jfield: 'reporter', zfield: 'reporter' },
            { jfield: 'environment', zfield: 'environment' },
            { jfield: 'duedate', zfield: 'dueAt' },
            { jfield: 'labels', zfield: 'labels' },
            { jfield: 'customfield_10313', zfield: 'sprints' },
            { jfield: 'customfield_10114', zfield: 'points' },
            { jfield: 'comment.comments', zfield: 'comments' },
            {
              jfield: 'customfield_11115',
              zfield: 'originalPoints',
            },
            {
              jfield: 'customfield_11112',
              zfield: 'parentInitiative',
            },
            {
              jfield: 'customfield_10314',
              zfield: 'parentEpic',
            },
            { jfield: 'remoteLinks', zfield: 'remoteLinks' },
            { jfield: 'customfield_10850', zfield: 'endOfSupport' },
          ],
        },
        excludeDays: ['1900-01-01'],
        fetch: {
          maxNodes: 30,
        },
      },
    },
  ],
  testing: {
    webhook: {
      secret: 'PLEASE_CHANGE_ME',
    }
  }
};

export default defaultConfig;
