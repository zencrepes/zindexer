const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  entity:
    type: keyword
  esIndex:
    type: keyword
  active:
    type: boolean
  platform:
    type: keyword    
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  facets:
    type: nested
    properties:
      facetType: 
        type: keyword
      field:
        type: keyword
      name:
        type: keyword
      nullValue:
        type: keyword
      default:
        type: boolean
`;
export default yaml;
