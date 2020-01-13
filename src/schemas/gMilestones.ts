const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
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
  nodeId:
    type: keyword
  issues:
    properties:
      __typename:
        type: keyword
      totalCount:
        type: long
  number:
    type: long
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
