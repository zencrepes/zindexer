// Zencrepes configuration for that entity
const entity = 'githubLabels';
const config = {
  id: entity,
  name: 'Labels',
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
    {
      facetType: 'term',
      field: 'name',
      name: 'Name',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
};

export default config;
