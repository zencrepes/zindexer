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
    {
      facetType: 'date',
      field: 'updatedAt',
      name: 'Updated',
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
      field: 'dueOn',
      name: 'Due',
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
      field: 'title.keyword',
      name: 'Title',
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
  ],
  tableConfig: {
    itemsType: 'Github Milestones',
    defaultSortField: 'title.keyword',
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
        fieldType: 'date',
        sortField: 'createdAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Closed At',
        field: 'closedAt',
        fieldType: 'date',
        sortField: 'closedAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Repository',
        field: 'repository.name',
        sortField: 'repository.name.keyword',
        linkField: 'repository.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Organization',
        field: 'repository.owner.login',
        sortField: 'repository.owner.login.keyword',
        linkField: 'repository.owner.url',
        sortable: true,
        default: true,
      },
      {
        name: 'State',
        field: 'state',
        sortField: 'state',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Title',
        field: 'title',
        sortField: 'title.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },
      {
        name: 'Issues Count',
        field: 'issues.totalCount',
        sortField: 'issues.totalCount',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'pullRequests Count',
        field: 'pullRequests.totalCount',
        sortField: 'pullRequests.totalCount',
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
        default: false,
      },
    ],
  },
};

export default config;
