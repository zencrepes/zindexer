// Zencrepes configuration for that entity
const entity = 'circleciPipelines';
const config = {
  id: entity,
  name: 'Circleci Pipelines',
  platform: 'circleci',
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
      field: 'triggeredAt',
      name: 'Triggered',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'source.repository.name.keyword',
      name: 'Repository',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'source.repository.owner.login',
      name: 'Organization',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'trigger.actor.login',
      name: 'Triggered By',
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
      field: 'vcs.branch.keyword',
      name: 'Branch',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
  tableConfig: {
    itemsType: 'Circleci Envvars',
    defaultSortField: 'triggeredAt',
    columns: [
      {
        name: 'id',
        field: 'id',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'Triggered At',
        field: 'triggeredAt',
        sortField: 'triggeredAt',
        sortable: true,
        default: true,
      },
      {
        name: 'Triggered By',
        field: 'trigger.actor.login',
        sortField: 'trigger.actor.login',
        sortable: true,
        default: true,
      },
      {
        name: 'State',
        field: 'state',
        sortField: 'state',
        sortable: false,
        default: true,
      },
      {
        name: 'Commit',
        field: 'vcs.commit.subject',
        sortField: 'vcs.commit.subject',
        sortable: false,
        default: true,
      },
      {
        name: 'Repository',
        field: 'source.repository.name',
        sortField: 'source.repository.name.keyword',
        linkField: 'source.repository.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Organization',
        field: 'source.repository.owner.login',
        sortField: 'source.repository.owner.login.keyword',
        linkField: 'source.repository.owner.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Repo URL',
        field: 'source.repository.url',
        sortField: null,
        linkField: null,
        sortable: false,
        default: false,
      },
    ],
  },
};

export default config;
