const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  active:
    type: boolean
  branchProtectionRules:
    properties:
      totalCount:
        type: integer
  codeOfConduct:
    properties:
      body:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      id:
        type: keyword
      key:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      url:
        type: keyword
  createdAt:
    type: date
  databaseId:
    type: integer
  defaultBranchRef:
    properties:
      id:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      prefix:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
  description:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  diskUsage:
    type: integer
  forkCount:
    type: integer
  hasIssuesEnabled:
    type: boolean
  hasWikiEnabled:
    type: boolean
  nodeId:
    type: keyword
  isArchived:
    type: boolean
  isDisabled:
    type: boolean
  isFork:
    type: boolean
  isLocked:
    type: boolean
  isMirror:
    type: boolean
  isPrivate:
    type: boolean
  isTemplate:
    type: boolean
  issues:
    properties:
      edges:
        properties:
          node:
            properties:
              id:
                type: keyword
              updatedAt:
                type: date
      totalCount:
        type: integer
  labels:
    properties:
      totalCount:
        type: integer
  languages:
    properties:
      edges:
        properties:
          node:
            properties:
              color:
                type: keyword
              id:
                type: keyword
              name:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
      totalCount:
        type: integer
  milestones:
    properties:
      totalCount:
        type: integer
  name:
    type: text
    fields:
      raw:
        type: keyword
  nameWithOwner:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  org:
    properties:
      id:
        type: keyword
      login:
        type: keyword
      name:
        type: text
        fields:
          raw:
            type: keyword
      url:
        type: keyword
  owner:
    properties:
      id:
        type: keyword
      login:
        type: keyword
      url:
        type: keyword
  primaryLanguage:
    properties:
      color:
        type: keyword
      id:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
  projects:
    properties:
      totalCount:
        type: integer
  pullRequests:
    properties:
      edges:
        properties:
          node:
            properties:
              id:
                type: keyword
              updatedAt:
                type: date
      totalCount:
        type: integer
  pushedAt:
    type: date
  rebaseMergeAllowed:
    type: boolean
  refs:
    properties:
      edges:
        properties:
          node:
            properties:
              target:
                properties:
                  author:
                    properties:
                      date:
                        type: date
                      email:
                        type: text
                        fields:
                          keyword:
                            type: keyword
                            ignore_above: 256
                      user:
                        properties:
                          id:
                            type: keyword
                          login:
                            type: keyword
                          name:
                            type: text
                            fields:
                              keyword:
                                type: keyword
                                ignore_above: 256
                  id:
                    type: keyword
                  pushedDate:
                    type: date
      totalCount:
        type: long
  releases:
    properties:
      totalCount:
        type: integer
  repositoryTopics:
    properties:
      totalCount:
        type: long
  shortDescriptionHTML:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  squashMergeAllowed:
    type: boolean
  stargazers:
    properties:
      totalCount:
        type: long
  updatedAt:
    type: date
  url:
    type: keyword
  vulnerabilityAlerts:
    properties:
      totalCount:
        type: long
  watchers:
    properties:
      totalCount:
        type: long  
`;
export default yaml;
