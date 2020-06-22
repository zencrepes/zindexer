const defaultImportConfig = {
  users: [
    { jiraEmail: 'user1@user.com', githubUsername: 'user1' },
    { jiraEmail: 'user1@user.com', githubUsername: 'user1' },
  ],
  repos: [{ jiraProjectKey: 'TECH', githubOrgRepo: 'MyOrg/MyRepo' }],
  labels: [{ from: 'Bug', to: 'bug' }],
};

export default defaultImportConfig;
