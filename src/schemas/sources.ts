const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  # This is not a GitHub field, it is used by the system to define which repositories should be grabbed
  active:
    type: boolean
  # Core properties of the entity
  id:
    type: keyword
  type:
    type: keyword
  server:
    type: keyword
  name:
    type: keyword
  uuid:
    type: keyword
`;
export default yaml;
