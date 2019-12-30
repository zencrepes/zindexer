const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  # This is not a GitHub field, it is used by the system to define which repositories should be grabbed
  __typename:
    type: keyword
  body:
    type: text
  columns:
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
              cards:
                properties:
                  __typename:
                    type: keyword
                  totalCount:
                    type: short
              databaseId:
                type: integer
              id:
                type: keyword
              name:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
      totalCount:
        type: short
  createdAt:
    type: date
  databaseId:
    type: integer
  id:
    type: keyword
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  number:
    type: integer
  owner:
    properties:
      __typename:
        type: keyword
      databaseId:
        type: integer
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
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          url:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
      url:
        type: keyword
  pendingCards:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: short
  state:
    type: keyword
  updatedAt:
    type: date
  url:
    type: keyword 
`;
export default yaml;
