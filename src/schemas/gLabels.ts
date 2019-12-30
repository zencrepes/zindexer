const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  __typename:
    type: keyword
  color:
    type: keyword
  createdAt:
    type: date
  description:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  id:
    type: keyword
  isDefault:
    type: boolean
  issues:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: long
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  pullRequests:
    properties:
      __typename:
        type: keyword
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
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          url:
            type: keyword
      url:
        type: keyword
  updatedAt:
    type: date
  url:
    type: keyword
`;
export default yaml;
