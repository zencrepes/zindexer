const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  author:
    properties:
      company:
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
  isDraft:
    type: boolean
  isPrerelease:
    type: boolean
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  publishedAt:
    type: date
  tagName:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  updatedAt:
    type: date
  url:
    type: keyword
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
`;
export default yaml;
