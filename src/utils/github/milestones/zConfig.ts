// Zencrepes configuration for that entity
const entity = 'githubMilestones';
const config = {
  id: entity,
  name: 'Milestones',
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
