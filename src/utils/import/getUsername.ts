// Build an issue markdown header based on the received issue
const getUsername = (email: string, users: any[]) => {
  const user = users.find(u => u.jira.emailAddress === email);
  if (user !== undefined) {
    return user.github.username;
  } else {
    return 'unkown user';
  }
};

export default getUsername;
