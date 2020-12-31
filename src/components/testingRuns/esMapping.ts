const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  version:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  full:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256        
  dependencies:
    properties:
      totalCount:
        type: integer    
      edges:
        type: nested
        properties:
          node:
            properties:        
              id:
                type: keyword
              name:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              version:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              full:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256                    
              url:
                type: keyword                   
  createdAt:
    type: date
  state:
    type: keyword    
  runTotal:
    type: integer
  runSuccess:
    type: integer 
  runSuccessRate:
    type: integer         
  runFailure:
    type: integer
  runFailureRate:
    type: integer     
  url:
    type: keyword
`;
export default yaml;
