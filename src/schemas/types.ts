const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  active:
    type: boolean
  type:
    type: keyword
  index:
    type: keyword
`;
export default yaml;
