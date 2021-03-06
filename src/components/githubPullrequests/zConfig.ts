// Zencrepes configuration for that entity
const entity = 'githubPullrequests';
const config = {
  id: entity,
  name: 'Pull Requests',
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
      nullValue: 'NO ASSIGNEE',
      nullFilter:
        '{"op":"<=","content":{"field":"assignees.totalCount","value":0}}',
      default: false,
    },
    {
      facetType: 'term',
      field: 'labels.edges.node.name.keyword',
      name: 'Labels',
      nullValue: 'NO LABEL',
      nullFilter:
        '{"op":"<=","content":{"field":"labels.totalCount","value":0}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'milestone.state',
      name: 'Milestone States',
      nullValue: 'NO MILESTONE',
      nullFilter:
        '{"op":"in","content":{"field":"milestone.state","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'milestone.title.keyword',
      name: 'Milestone',
      nullValue: 'NO MILESTONE',
      nullFilter:
        '{"op":"in","content":{"field":"milestone.title.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'projectCards.edges.node.project.name.keyword',
      name: 'Projects',
      nullValue: 'NO PROJECT',
      nullFilter:
        '{"op":"<=","content":{"field":"projectCards.totalCount","value":0}}',
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
      name: 'Review Decision',
      nullValue: 'NO DECISION',
      nullFilter:
        '{"op":"in","content":{"field":"reviewDecision","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'reviews.edges.node.state',
      name: 'Reviews',
      nullValue: 'NO REVIEW',
      nullFilter:
        '{"op":"<=","content":{"field":"reviews.totalCount","value":0}}',
      default: false,
    },
    {
      facetType: 'term',
      field: 'reviews.edges.node.author.login',
      name: 'Reviewers',
      nullValue: 'NO REVIEWER',
      nullFilter:
        '{"op":"<=","content":{"field":"reviews.totalCount","value":0}}',
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
  tableConfig: {
    itemsType: 'Github PRs',
    defaultSortField: 'createdAt',
    columns: [
      {
        name: 'id',
        field: 'id',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'Created At',
        field: 'createdAt',
        sortField: 'createdAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Closed At',
        field: 'closedAt',
        sortField: 'closedAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Title',
        field: 'title',
        sortField: 'title.keyword',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Url',
        field: 'url',
        sortField: 'url',
        linkField: null,
        sortable: false,
        default: true,
      },
    ],
  },
};

export default config;
