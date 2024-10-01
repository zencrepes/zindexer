const defaultImportConfig = {
  users: [{ 
    jira: {
      name: 'user1',
      key: 'user1',
      emailAddress: 'user1@user.com',
      displayName: 'User One',
    },
    github: {
      username: 'user1'
    },
  }, {
    jira: {
      name: 'user2',
      key: 'user2',
      emailAddress: 'user2@user.com',
      displayName: 'User Two',
    },
    github: {
      username: 'user1'
    }, 
  }],
  repos: [
    { jiraProjectKey: 'TECH', githubOrgRepo: 'MyOrg/MyRepo' },
    {
      jiraProjectKey: 'BACKLOG',
      githubOrgRepo: 'MyOrg/MyRepo',
      archive: {
        date: '2018-01-01',
        field: 'createdAt',
        githubOrgRepo: 'MyOrg/MyRepo-archive',
      },
    },
  ],
  labels: [{ from: 'Bug', to: 'bug' }],
  linkReplace: 'https://jira.myorg.com/browse/',
};

export default defaultImportConfig;
