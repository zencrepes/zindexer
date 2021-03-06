// Zencrepes configuration for that entity
const entity = 'githubProjects';
const config = {
  id: entity,
  name: 'Projects',
  platform: 'github',
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
      field: 'closedAt',
      name: 'Closed',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'projectLevel',
      name: 'Project Level',
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
      field: 'name.keyword',
      name: 'Name',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'columns.edges.node.name.keyword',
      name: 'Columns',
      nullValue: 'NO COLUMNS',
      nullFilter:
        '{"op":"<=","content":{"field":"columns.totalCount","value":0}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.name.keyword',
      name: 'Repository',
      nullValue: 'NO REPOSITORY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'organization.login.keyword',
      name: 'Organization',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'number',
      field: 'pendingCards.totalCount',
      name: 'Pending Cards',
      nullValue: 'EMPTY',
      default: false,
    },
  ],
  tableConfig: {
    itemsType: 'Github Projects',
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
        name: 'Created At',
        field: 'createdAt',
        fieldType: 'date',
        sortField: 'createdAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Closed At',
        field: 'closedAt',
        fieldType: 'date',
        sortField: 'closedAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Repository',
        field: 'repository.name',
        sortField: 'repository.name.keyword',
        linkField: 'repository.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Organization',
        field: 'organization.login',
        sortField: 'organization.login.keyword',
        linkField: 'organization.url',
        sortable: true,
        default: true,
      },
      {
        name: 'State',
        field: 'state',
        sortField: 'state',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Name',
        field: 'name',
        sortField: 'title.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },
      {
        name: 'Body',
        field: 'body',
        sortField: 'body.keyword',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Pending Cards',
        field: 'pendingCards.totalCount',
        sortField: 'pendingCards.totalCount',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Columns',
        field: 'columns.edges',
        subfield: 'node.name',
        fieldType: 'array',
        sortField: null,
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Url',
        field: 'url',
        sortField: 'url',
        linkField: null,
        sortable: false,
        default: false,
      },
    ],
  },
};

export default config;
