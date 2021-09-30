// Zencrepes configuration for that entity
const entity = 'testingPerfs';
const config = {
  id: entity,
  name: 'Testing Perfs',
  platform: 'testing',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'startedAt',
      name: 'Started At',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'term',
      field: 'name.keyword',
      name: 'Name',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.name',
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
    itemsType: 'Testing Perfs',
    defaultSortField: 'startedAt',
    columns: [
      {
        name: 'id',
        field: 'id',
        fieldType: 'string',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'Name',
        field: 'name',
        fieldType: 'string',
        sortField: 'name.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },     
    ],
  },
};

export default config;
