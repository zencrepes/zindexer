const aggsState = [
  { field: 'nodeId', active: true, show: false },
  { field: 'fields__assignee__name', active: true, show: true },
  { field: 'fields__components__name', active: true, show: true },
  { field: 'fields__created', active: true, show: true },
  { field: 'fields__creator__name', active: true, show: true },
  { field: 'fields__issuetype__name', active: true, show: true },
  { field: 'fields__priority__name', active: true, show: true },
  { field: 'fields__project__name', active: true, show: true },
  { field: 'fields__reporter__name', active: true, show: true },
  { field: 'fields__resolution__name', active: true, show: true },
  { field: 'fields__status__name', active: true, show: true },
  { field: 'fields__updated', active: true, show: true },
];

const columnsState = {
  type: 'jiraIssues',
  keyField: 'id',
  defaultSorted: [{ id: 'nodeId', desc: false }],
  columns: [
    {
      field: 'nodeId',
      accessor: 'nodeId',
      id: null,
      jsonPath: null,
      query: null,
      canChangeShow: true,
      sortable: true,
      type: 'string',
      show: true,
    },
    {
      field: 'fields.summary',
      accessor: 'fields.summary',
      id: null,
      jsonPath: null,
      query: null,
      canChangeShow: true,
      sortable: true,
      type: 'string',
      show: true,
    },
    {
      field: 'fields.issuetype.name',
      accessor: 'fields.issuetype.name',
      id: null,
      jsonPath: null,
      query: null,
      canChangeShow: true,
      sortable: true,
      type: 'string',
      show: true,
    },
  ],
};

const matchBoxState = [
  {
    displayName: 'jiraIssues',
    field: '',
    isActive: false,
    keyField: null,
    searchFields: [],
  },
];

export const arrangerConfig = {
  aggsState,
  columnsState,
  matchBoxState,
};
