const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  __typename:
    type: keyword
  active:
    type: boolean
  branchProtectionRules:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: integer
  codeOfConduct:
    properties:
      __typename:
        type: keyword
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
      __typename:
        type: keyword
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
  id:
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
      __typename:
        type: keyword
      edges:
        properties:
          __typename:
            type: keyword
          node:
            properties:
              __typename:
                type: keyword
              id:
                type: keyword
              updatedAt:
                type: date
      totalCount:
        type: integer
  labels:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: integer
  languages:
    properties:
      __typename:
        type: keyword
      edges:
        properties:
          __typename:
            type: keyword
          node:
            properties:
              __typename:
                type: keyword
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
      __typename:
        type: keyword
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
      __typename:
        type: keyword
      id:
        type: keyword
      login:
        type: keyword
      url:
        type: keyword
  primaryLanguage:
    properties:
      __typename:
        type: keyword
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
      __typename:
        type: keyword
      totalCount:
        type: integer
  pullRequests:
    properties:
      __typename:
        type: keyword
      edges:
        properties:
          __typename:
            type: keyword
          node:
            properties:
              __typename:
                type: keyword
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
      __typename:
        type: keyword
      edges:
        properties:
          __typename:
            type: keyword
          node:
            properties:
              __typename:
                type: keyword
              target:
                properties:
                  __typename:
                    type: keyword
                  author:
                    properties:
                      __typename:
                        type: keyword
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
                          __typename:
                            type: text
                            fields:
                              keyword:
                                type: keyword
                                ignore_above: 256
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
      __typename:
        type: keyword
      totalCount:
        type: integer
  repositoryTopics:
    properties:
      __typename:
        type: keyword
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
      __typename:
        type: keyword
      totalCount:
        type: long
  updatedAt:
    type: date
  url:
    type: keyword
  vulnerabilityAlerts:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: long
  watchers:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: long  
`;
export default yaml;
