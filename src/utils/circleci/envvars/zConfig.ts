// Zencrepes configuration for that entity
const entity = 'circleciEnvvars';
const config = {
  id: entity,
  name: 'Circleci EnvVars',
  platform: 'circleci',
  active: true,
  facets: [
    {
      facetType: 'term',
      field: 'name.keyword',
      name: 'Variable Name',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'value.keyword',
      name: 'Variable Value',
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
  ],
  tableConfig: {
    itemsType: 'Circleci Envvars',
    defaultSortField: 'name.keyword',
    columns: [
      {
        name: 'id',
        field: 'id',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'Name',
        field: 'name',
        sortField: 'name.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },
      {
        name: 'Value',
        field: 'value',
        sortField: 'value.keyword',
        linkField: null,
        sortable: true,
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
    ],
  },
};

export default config;
