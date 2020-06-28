const defaultImportConfig = {
  users: [
    { jiraEmail: 'user1@user.com', githubUsername: 'user1' },
    { jiraEmail: 'user1@user.com', githubUsername: 'user1' },
  ],
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
