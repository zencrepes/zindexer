const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  zsource:
    type: keyword    
  zindexerSourceId:
    type: keyword    
  key:
    type: keyword
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256    
  number:
    type: integer
  startedAt:
    type: date
  completedAt:
    type: date 
  duration:
    type: integer         
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
  runSkipped:
    type: integer
  runQuarantined:
    type: integer
  successful:
    type: boolean
  withTests:
    type: boolean    
  url:
    type: keyword
  state:
    type: keyword
  plan:
    properties:
      id:
        type: keyword
      shortKey:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      project:
        properties:
          id: 
            type: keyword
          name:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256            
`;
export default yaml;
