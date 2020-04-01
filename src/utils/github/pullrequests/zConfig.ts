// Zencrepes configuration for that entity
const entity = 'githubPullrequests';
const config = {
  id: entity,
  facets: [
    {
      facetType: 'term',
      field: 'author.login',
      name: 'Authors',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'state',
      name: 'State',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.name.keyword',
      name: 'Repository',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.owner.login',
      name: 'Organization',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'milestone.title.keyword',
      name: 'Milestone',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'milestone.state',
      name: 'Milestone States',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
};

export default config;
