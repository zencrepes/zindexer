const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  nodeId:
    type: keyword
  name:
    type: text
    fields: 
      keyword:
        type: keyword
        ignore_above: 256
  metrics:
    properties:
      success_rate:
        type: float             
      total_runs:
        type: long 
      failed_runs:
        type: long 
      successful_runs:
        type: long 
      throughput:
        type: float         
      mttr:
        type: long 
      total_credits_used:
        type: float 
      duration_metrics:
        properties:  
          min:
            type: long 
          mean:
            type: long
          median:
            type: long
          p95:
            type: long
          max:
            type: long
          standard_deviation:
            type: float
  window_start:
    type: date
  window_end:
    type: date   
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
