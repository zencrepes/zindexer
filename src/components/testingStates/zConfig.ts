// Zencrepes configuration for that entity
const entity = 'testingStates';
const config = {
  id: entity,
  name: 'Testing States',
  platform: 'testing',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'createdAt',
      name: 'Created At',
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
      field: 'version.keyword',
      name: 'Version',
      nullValue: 'EMPTY',
      default: true,
    },   
    {
      facetType: 'term',
      field: 'full.keyword',
      name: 'Name & Version',
      nullValue: 'EMPTY',
      default: false,
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
      field: 'dependencies.edges.node.full.keyword',
      name: 'Dependencies',
      nullValue: 'NO Dependencies',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"dependencies.totalCount","value":0}}',
      default: true,
    }, 
    {
      facetType: 'term',
      field: 'dependencies.edges.node.name.keyword',
      name: 'Dep. name',
      nullValue: 'NO Dependencies',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"dependencies.totalCount","value":0}}',
      default: false,
    },
    {
      facetType: 'term',
      field: 'dependencies.edges.node.version.keyword',
      name: 'Dep. version',
      nullValue: 'NO Dependencies',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"dependencies.totalCount","value":0}}',
      default: false,
    },     
  ],
  tableConfig: {
    itemsType: 'Testing States',
    defaultSortField: 'createdAt',
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
      {
        name: 'Version',
        field: 'version',
        fieldType: 'string',
        sortField: 'version.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
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
        name: 'State',
        field: 'state',
        fieldType: 'string',
        sortField: 'state',
        sortable: true,
        default: true,
      },
      {
        name: 'Total',
        field: 'runTotal',
        fieldType: 'string',
        sortField: 'runTotal',
        sortable: true,
        default: true,
      },   
      {
        name: 'Run Success',
        field: 'runSuccess',
        fieldType: 'string',
        sortField: 'runSuccess',
        sortable: true,
        default: true,
      },   
      {
        name: 'Run Failure',
        field: 'runFailure',
        fieldType: 'string',
        sortField: 'runFailure',
        sortable: true,
        default: true,
      },
      {
        name: 'Run Duration',
        field: 'runDuration',
        fieldType: 'string',
        sortField: 'runDuration',
        sortable: true,
        default: true,
      },      
    ],
  },
};

export default config;
