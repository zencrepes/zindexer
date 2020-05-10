// Zencrepes configuration for that entity
const entity = 'githubWatchers';
const config = {
  id: entity,
  name: 'Watchers',
  platform: 'github',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'lastStarredAt',
      name: 'Last Starred',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'date',
      field: 'createdAt',
      name: 'Created',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'term',
      field: 'login',
      name: 'User',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'dataType',
      name: 'Data Type',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repositories.edges.node.name.keyword',
      name: 'Watched Repository',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repositories.edges.node.owner.login',
      name: 'Watched Organization',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'organizations.edges.node.login',
      name: 'User Organization',
      nullValue: 'NO Organization',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"organizations.totalCount","value":0}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'company.keyword',
      name: 'User Company',
      nullValue: 'NOT DETAILED',
      nullFilter:
        '{"op":"in","content":{"field":"company.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isEmployee',
      name: 'GitHub Staff',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isHireable',
      name: 'Hireable',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isDeveloperProgramMember',
      name: 'Dev. Program',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isCampusExpert',
      name: 'Campus Exp.',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isBountyHunter',
      name: 'Bounty Hunter',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
  ],
};

export default config;
