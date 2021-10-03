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
      default: true,
    },
    {
      facetType: 'term',
      field: 'name.keyword',
      name: 'Run Name',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'rampUp',
      name: 'Ramp-Up',
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
      field: 'resources.edges.node.name',
      name: 'Resource name',
      nullValue: 'NO ASSIGNEE',
      nullFilter:
        '{"op":"<=","content":{"field":"resources.totalCount","value":0}}',
      default: true,
    },    
    {
      facetType: 'term',
      field: 'resources.edges.node.size',
      name: 'Resource size',
      nullValue: 'NO RESOURCE',
      nullFilter:
        '{"op":"<=","content":{"field":"resources.totalCount","value":0}}',
      default: true,
    }, 
    {
      facetType: 'term',
      field: 'resources.edges.node.image',
      name: 'Resource image',
      nullValue: 'NO RESOURCE',
      nullFilter:
        '{"op":"<=","content":{"field":"resources.totalCount","value":0}}',
      default: true,
    }         
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
      {
        name: 'Started At',
        field: 'startedAt',
        fieldType: 'date',
        sortField: 'startedAt',
        sortable: true,
        default: true,
      },    
      {
        name: 'Duration (s)',
        field: 'duration',
        fieldType: 'number',
        sortField: 'duration',
        linkField: 'url',
        sortable: true,
        default: true,
      },            
    ],
  },
};

export default config;
