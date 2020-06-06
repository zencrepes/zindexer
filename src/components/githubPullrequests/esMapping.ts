const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  assignees:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              avatarUrl:
                type: keyword
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
              url:
                type: keyword
      totalCount:
        type: long
  author:
    properties:
      avatarUrl:
        type: keyword
      login:
        type: keyword
      url:
        type: keyword
  body:
    type: keyword
  closedAt:
    type: date
  openedDuring:
    type: long
  comments:
    properties:
      totalCount:
        type: long
  createdAt:
    type: date
  databaseId:
    type: long
  labels:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              color:
                type: keyword
              description:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              id:
                type: keyword
              name:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
      totalCount:
        type: long      
  milestone:
    properties:
      closedAt:
        type: date
      createdAt:
        type: date
      description:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      dueOn:
        type: date
      id:
        type: keyword
      issues:
        properties:
          totalCount:
            type: long
      number:
        type: long
      state:
        type: keyword
      title:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      updatedAt:
        type: date
      url:
        type: keyword
  number:
    type: long
  participants:
    properties:
      totalCount:
        type: long
  projectCards:
    properties:
      edges:
        type: nested      
        properties:
          node:
            properties:
              id:
                type: keyword
              project:
                properties:
                  id:
                    type: keyword
                  name:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
      totalCount:
        type: long
  reviewRequests:
    properties:
      totalCount:
        type: long     
      edges:
        type: nested
        properties:
          node:
            properties:
              login:
                type: keyword
              url:
                type: keyword
              avatarUrl:
                type: keyword               
  reviewDecision:
    type: keyword
  reviews:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              state:
                type: keyword
              author:
                properties:
                  login:
                    type: keyword
                  url:
                    type: keyword
                  avatarUrl:
                    type: keyword  
      totalCount:
        type: long                  
  repository:
    properties:
      databaseId:
        type: long
      id:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      owner:
        properties:
          id:
            type: keyword
          login:
            type: keyword
          url:
            type: keyword
      url:
        type: keyword
  state:
    type: keyword
  title:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  updatedAt:
    type: date
  url:
    type: keyword
`;
export default yaml;
