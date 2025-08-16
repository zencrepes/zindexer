// Zencrepes configuration for that entity
const entity = 'githubCopilotmetrics';
const config = {
  id: entity,
  name: 'Milestones',
  platform: 'github',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'date',
      name: 'Date',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'org',
      name: 'Organization',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
  tableConfig: {
    itemsType: 'Github Copilot Metrics',
    defaultSortField: 'date',
    columns: [
      {
        name: 'id',
        field: 'id',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'org',
        field: 'org',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'date',
        field: 'date',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'Total active users',
        field: 'total_active_users',
        sortField: 'total_active_users',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Total engaged users',
        field: 'total_engaged_users',
        sortField: 'total_active_users',
        linkField: null,
        sortable: true,
        default: true,
      },
    ],
  },
};

export default config;
