// Zencrepes configuration for that entity
const entity = 'githubVulnerabilities';
const config = {
  id: entity,
  name: 'Vulnerabilities',
  platform: 'github',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'createdAt',
      name: 'Created',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'date',
      field: 'dismissedAt',
      name: 'Dismissed',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'term',
      field: 'securityVulnerability.severity',
      name: 'Severity',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'securityVulnerability.package.ecosystem',
      name: 'Ecosystem',
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
      field: 'repository.name.keyword',
      name: 'Repository',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'dismisser.login',
      name: 'Dismisser',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'securityVulnerability.package.name',
      name: 'Package',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'vulnerableManifestFilename',
      name: 'Filename',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
};

export default config;
