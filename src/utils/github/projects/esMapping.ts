const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  # This is not a GitHub field, it is used by the system to define which repositories should be grabbed
  body:
    type: text
  columns:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              cards:
                properties:
                  totalCount:
                    type: long
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
        type: long
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
  projectLevel:
    type: keyword    
  repository:
    properties:
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
  organization:
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
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256        
  pendingCards:
    properties:
      totalCount:
        type: long
  state:
    type: keyword
  updatedAt:
    type: date
  url:
    type: keyword 
`;
export default yaml;
