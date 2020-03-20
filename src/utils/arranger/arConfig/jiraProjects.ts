const aggsState = [
  { field: 'archived', active: true, show: true },
  { field: 'lead__name', active: true, show: true },
  { field: 'roles_acctors__name', active: true, show: true },
];

const columnsState = {
  type: 'jiraProjects',
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
      field: 'archived',
      accessor: 'archived',
      id: null,
      jsonPath: null,
      query: null,
      canChangeShow: true,
      sortable: true,
      type: 'boolean',
      show: true,
    },
    {
      field: 'name',
      accessor: 'name',
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
    displayName: 'jiraProjects',
    field: '',
    isActive: false,
    keyField: null,
    searchFields: [],
  },
];

const extendedMapping = [
  {
    field: 'roles.actors.name',
    type: 'keyword',
    displayName: 'Roles Actors Name',
    active: false,
    isArray: true,
    primaryKey: false,
    quickSearchEnabled: false,
    unit: null,
    displayValues: {},
    rangeStep: 1,
  },
];

export const arrangerConfig = {
  aggsState,
  columnsState,
  matchBoxState,
  extendedMapping,
};
