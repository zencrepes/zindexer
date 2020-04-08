// Zencrepes configuration for that entity
const entity = 'githubPullrequests';
const config = {
  id: entity,
  facets: [
    {
      facetType: 'term',
      field: 'assignees.edges.node.login',
      name: 'Assignees',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'author.login',
      name: 'Authors',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'labels.edges.node.name.keyword',
      name: 'Labels',
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
    {
      facetType: 'term',
      field: 'milestone.title.keyword',
      name: 'Milestone',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'projectCards.edges.node.project.name.keyword',
      name: 'Projects',
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
      field: 'state',
      name: 'State',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'metrics',
      field: 'comments.totalCount',
      name: 'Comments Count',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'metrics',
      field: 'assignees.totalCount',
      name: 'Assignees Count',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'metrics',
      field: 'labels.totalCount',
      name: 'Labels Count',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'metrics',
      field: 'participants.totalCount',
      name: 'Participants Count',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'metrics',
      field: 'projectCards.totalCount',
      name: 'Cards Count',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'date',
      field: 'createdAt',
      name: 'Filter Date',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
};

export default config;
