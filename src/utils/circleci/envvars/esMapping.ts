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
  value:
    type: text
    fields: 
      keyword:
        type: keyword
        ignore_above: 256
  source:
    properties:
      uuid:
        type: keyword  
      id:
        type: keyword            
      type:
        type: keyword
      name:
        type: text
        fields: 
          keyword:
            type: keyword
            ignore_above: 256
      active:
        type: boolean                              
`;
export default yaml;
