const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  key:
    type: keyword
  name:
    type: keyword    
  active:
    type: boolean
  esIndex:
    type: keyword
  type:
    type: keyword    
`;
export default yaml;
