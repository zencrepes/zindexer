const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  org:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256    
  date:
    type: date
`;
export default yaml;
