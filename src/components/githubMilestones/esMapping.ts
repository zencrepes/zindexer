const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
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
  pullRequests:
    properties:
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
