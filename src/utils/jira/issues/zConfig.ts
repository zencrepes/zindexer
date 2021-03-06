// Zencrepes configuration for that entity
const entity = 'jiraIssues';
const config = {
  id: entity,
  name: 'Jira Issues',
  platform: 'jira',
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
      field: 'closedAt',
      name: 'Closed',
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
      field: 'endOfSupport',
      name: 'End Of Support',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'assignee.active',
      name: 'Assignee Active',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'reporter.active',
      name: 'Reporter Active',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'term',
      field: 'server.name.keyword',
      name: 'Jira Server',
      nullValue: 'NO SERVER',
      nullFilter:
        '{"op":"in","content":{"field":"server.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'project.name.keyword',
      name: 'Jira Project',
      nullValue: 'NO EPIC',
      nullFilter:
        '{"op":"in","content":{"field":"project.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'status.statusCategory.name.keyword',
      name: 'State',
      nullValue: 'NO STATE',
      nullFilter:
        '{"op":"in","content":{"field":"status.statusCategory.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'resolution.name.keyword',
      name: 'Resolution',
      nullValue: 'NO RESOLUTION',
      nullFilter:
        '{"op":"in","content":{"field":"resolution.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'priority.name.keyword',
      name: 'Priority',
      nullValue: 'NO PRIORITY',
      nullFilter:
        '{"op":"in","content":{"field":"priority.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'type.name.keyword',
      name: 'Type',
      nullValue: 'NO TYPE',
      nullFilter:
        '{"op":"in","content":{"field":"type.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'assignee.name.keyword',
      name: 'Assignee',
      nullValue: 'NO ASSIGNEE',
      nullFilter:
        '{"op":"in","content":{"field":"assignee.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'reporter.name.keyword',
      name: 'Reporter',
      nullValue: 'NO REPORTER',
      nullFilter:
        '{"op":"in","content":{"field":"reporter.name.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'parentEpic.keyword',
      name: 'Epic',
      nullValue: 'NO EPIC',
      nullFilter:
        '{"op":"in","content":{"field":"parentEpic.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'environment.keyword',
      name: 'Environment',
      nullValue: 'NO ENVIRONMENT',
      nullFilter:
        '{"op":"in","content":{"field":"environment.keyword","value":["__missing__"]}}',
      default: true,
    },

    {
      facetType: 'term',
      field: 'fixVersions.edges.node.name.keyword',
      name: 'Fix Versions',
      nullValue: 'NO Fix Version',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"fixVersions.totalCount","value":0}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'versions.edges.node.name.keyword',
      name: 'Affect Versions',
      nullValue: 'NO Fix Version',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"versions.totalCount","value":0}}',
      default: true,
    },
  ],
  tableConfig: {
    itemsType: 'Jira Issues',
    columns: [
      {
        name: 'Type',
        field: 'type.name',
        sortField: 'type.name.keyword',
        sortable: true,
      },
      { name: 'Issue Key', field: 'key', sortField: 'key', sortable: true },
      {
        name: 'Summary',
        field: 'summary',
        sortField: 'summary.keyword',
        sortable: true,
      },
      {
        name: 'Priority',
        field: 'priority.name',
        sortField: 'priority.name.keyword',
        sortable: true,
      },
      {
        name: 'Resolution',
        field: 'resolution.name',
        sortField: 'resolution.name.keyword',
        sortable: true,
      },
      {
        name: 'Remote Links Count',
        field: 'remoteLinks.totalCount',
        sortField: 'remoteLinks.totalCount',
        sortable: false,
      },
      {
        name: 'Remote Links Keys',
        field: 'remoteLinks.edges',
        fieldType: 'array',
        fieldNode: 'node.key',
        sortField: 'remoteLinks.totalCount',
        sortable: false,
      },
      {
        name: 'Remote Links Points',
        field: 'remoteLinks.edges',
        fieldType: 'arraysum',
        fieldNode: 'node.points',
        sortField: 'remoteLinks.totalCount',
        sortable: false,
      },
      {
        name: 'Created At',
        field: 'createdAt',
        sortField: 'createdAt',
        sortable: true,
      },
      {
        name: 'Updated At',
        field: 'updatedAt',
        sortField: 'updatedAt',
        sortable: true,
      },
      {
        name: 'Closed At',
        field: 'closedAt',
        sortField: 'closedAt',
        sortable: true,
      },
      {
        name: 'Project Key',
        field: 'project.key',
        sortField: 'project.key',
        sortable: true,
      },
      {
        name: 'Project Name',
        field: 'project.name',
        sortField: 'project.name.keyword',
        sortable: false,
      },
      {
        name: 'End Of Support',
        field: 'endOfSupport',
        sortField: 'endOfSupport',
        sortable: true,
      },
    ],
  },
};

export default config;
