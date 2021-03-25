const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  zsource:
    type: keyword
  active:
    type: boolean
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
  id:
    type: keyword
  isArchived:
    type: boolean
  isDisabled:
    type: boolean
  isFork:
    type: boolean
  hasPom:
    type: boolean   
  hasParent:
    type: boolean       
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
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
  pushedAt:
    type: date
  repositoryTopics:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              id:
                type: keyword            
              topic:
                properties:
                  id:
                    type: keyword 
                  name:
                    type: keyword                     
              url:
                type: keyword
      totalCount:
        type: long
  updatedAt:
    type: date
  url:
    type: keyword
  pom:
    properties:
      name:
        type: keyword    
      version:
        type: keyword
      artifactId:
        type: keyword
      groupId:
        type: keyword
      parent:
        properties:
          version:
            type: keyword
          artifactId:
            type: keyword
          groupId:
            type: keyword 
  recentCommitsMainBranch:
    properties:
      name:
        type: keyword
      target:
        properties:
          id:
            type: keyword
          history:
            properties:
              edges:
                type: nested
                properties:
                  node:
                    properties:
                      pushedDate:
                        type: date
                      messageHeadline:
                        type: text
                        fields:
                          keyword:
                            type: keyword
                            ignore_above: 256          
                      author:
                        properties:
                          date:
                            type: date
                          email:
                            type: keyword
                          user:
                            properties:
                              name:
                                type: keyword
                              login:
                                type: keyword
                              id:
                                type: keyword
              totalCount:
                type: long     
  lastCommitMainBranch:
    properties:
      pushedDate:
        type: date
      messageHeadline:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256          
      author:
        properties:
          date:
            type: date
          email:
            type: keyword
          user:
            properties:
              name:
                type: keyword
              login:
                type: keyword
              id:
                type: keyword
`;
export default yaml;
