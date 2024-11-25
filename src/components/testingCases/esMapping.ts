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
  suite:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  project:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  jahia:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  module:
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
  createdAt:
    type: date
  state:
    type: keyword
  caseTotal:
    type: integer
  caseSuccess:
    type: integer 
  caseSuccessRate:
    type: integer
  caseFailure:
    type: integer
  caseFailureRate:
    type: integer
  duration:
    type: keyword    
  url:
    type: keyword
`;
export default yaml;
