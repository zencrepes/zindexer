// Build an issue markdown header based on the received issue
const getUsername = (email: string, users: any[]) => {
  const user = users.find(u => u.jiraEmail === email);
  if (user !== undefined) {
    return user.githubUsername;
  } else {
    return 'unkown user';
  }
};

export default getUsername;
