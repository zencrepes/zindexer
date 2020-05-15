// Zencrepes configuration for that entity
const entity = 'githubProjects';
const config = {
  id: entity,
  name: 'Projects',
  platform: 'github',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'createdAt',
      name: 'Created',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
};

export default config;
