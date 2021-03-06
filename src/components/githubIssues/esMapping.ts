const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  zsource:
    type: keyword
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
              points:
                type: integer                
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
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  closedAt:
    type: date
  points:
    type: integer
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
              points:
                type: integer
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
                  points:
                    type: integer
              olumn:
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
