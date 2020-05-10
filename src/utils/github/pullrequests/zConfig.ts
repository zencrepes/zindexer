// Zencrepes configuration for that entity
const entity = 'githubPullrequests';
const config = {
  id: entity,
  name: 'Pull requests',
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
      facetType: 'date',
      field: 'closedAt',
      name: 'Closed',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'date',
      field: 'updatedAt',
      name: 'Updated',
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
      field: 'author.login',
      name: 'Authors',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'assignees.edges.node.login',
      name: 'Assignees',
      nullValue: 'EMPTY',
      default: false,
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
      field: 'reviewDecision',
      name: 'Review Decisions',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'reviews.edges.node.state',
      name: 'Reviews',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'term',
      field: 'reviews.edges.node.author.login',
      name: 'Reviewers',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'metrics',
      field: 'comments.totalCount',
      name: 'Comments',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'metrics',
      field: 'assignees.totalCount',
      name: 'Assignees',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'metrics',
      field: 'labels.totalCount',
      name: 'Labels',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'metrics',
      field: 'participants.totalCount',
      name: 'Participants',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'metrics',
      field: 'projectCards.totalCount',
      name: 'Cards',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'metrics',
      field: 'openedDuring',
      name: 'Opened During (days)',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'metrics',
      field: 'reviewRequests.totalCount',
      name: 'Review Requests',
      nullValue: 'EMPTY',
      default: false,
    },
  ],
};

export default config;
