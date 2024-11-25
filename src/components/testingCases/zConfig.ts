// Zencrepes configuration for that entity
const entity = 'testingCases';
const config = {
  id: entity,
  name: 'Testing Cases',
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
      name: 'Test Case',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'suite.keyword',
      name: 'Suite',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'project.keyword',
      name: 'Project',
      nullValue: 'EMPTY',
      default: true,
    },    
    {
      facetType: 'term',
      field: 'jahia.keyword',
      name: 'Jahia',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'module.keyword',
      name: 'Module',
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
  ],
  tableConfig: {
    itemsType: 'Testing Cases',
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
        name: 'Suite',
        field: 'suite',
        fieldType: 'string',
        sortField: 'suite.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },      
      {
        name: 'Jahia',
        field: 'jahia',
        fieldType: 'string',
        sortField: 'jahia.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },
      {
        name: 'Module',
        field: 'module',
        fieldType: 'string',
        sortField: 'module.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },
      {
        name: 'Created At',
        field: 'createdAt',
        fieldType: 'datetime',
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
        name: 'Duration',
        field: 'duration',
        fieldType: 'string',
        sortField: 'duration',
        sortable: true,
        default: true,
      },      
    ],
  },
};

export default config;
