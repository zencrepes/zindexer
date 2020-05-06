// Zencrepes configuration for that entity
const entity = 'githubRepositories';
const config = {
  id: entity,
  name: 'Repositories',
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
      field: 'pushedAt',
      name: 'Pushed',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'owner.login',
      name: 'Organization',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'codeOfConduct.name.keyword',
      name: 'Code of Conduct',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'defaultBranchRef.name.keyword',
      name: 'Default Branch',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'languages.edges.node.name.keyword',
      name: 'Languages',
      nullValue: 'NO LANGUAGES',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"languages.totalCount","value":0}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repositoryTopics.edges.node.topic.name',
      name: 'Topics',
      nullValue: 'NO TOPICS',
      nullFilter:
        '{"op":"<=","content":{"field":"repositoryTopics.totalCount","value":0}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'licenseInfo.nickname',
      name: 'License',
      nullValue: 'NO LICENSE',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isArchived',
      name: 'Archived',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isDisabled',
      name: 'Disabled',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isFork',
      name: 'Fork',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isLocked',
      name: 'Locked',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isMirror',
      name: 'Mirror',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isTemplate',
      name: 'Template',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'rebaseMergeAllowed',
      name: 'Rebase Merge',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
};

export default config;
