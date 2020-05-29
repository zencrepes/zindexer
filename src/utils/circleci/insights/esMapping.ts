const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  duration:
    type: long
  created_at:
    type: date
  stopped_at:
    type: date
  credits_used:
    type: long
  status:
    type: keyword
  job:
    properties:
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
      workflow:  
        properties:
          id:
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
              repository:
                properties:
                  databaseId:
                    type: long
                  id:
                    type: keyword
                  name:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
                  owner:
                    properties:
                      id:
                        type: keyword
                      login:
                        type: keyword
                      url:
                        type: keyword
                  url:
                    type: keyword                   
`;
export default yaml;
