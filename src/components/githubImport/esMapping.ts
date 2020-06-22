const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  zsource:
    type: keyword
  id:
    type: keyword
  createdAt:
    type: date
`;
export default yaml;
