const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
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
