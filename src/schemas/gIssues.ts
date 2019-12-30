const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  __typename:
    type: keyword
  assignees:
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
      __typename:
        type: keyword
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
  comments:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: long
  createdAt:
    type: date
  databaseId:
    type: long
  id:
    type: keyword
  labels:
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
      __typename:
        type: keyword
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
          __typename:
            type: keyword
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
      __typename:
        type: keyword
      totalCount:
        type: long
  projectCards:
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
              project:
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
      totalCount:
        type: long
  repository:
    properties:
      __typename:
        type: keyword
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
          __typename:
            type: keyword
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
