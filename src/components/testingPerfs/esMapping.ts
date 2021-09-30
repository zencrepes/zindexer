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
  startedAt:
    type: date
  duration:
    type: integer
  platform:
    properties:
      vendor:
        type: keyword
      tenant:
        type: keyword
      region:
        type: keyword       
  resources:
    properties:
      totalCount:
        type: integer    
      edges:
        type: nested
        properties:
          node:
            properties:        
              name:
                type: keyword
              size:
                type: keyword
              image:
                type: keyword 
              tfsettings:
                type: keyword                                 
  runs:
    properties:
      totalCount:
        type: integer    
      edges:
        type: nested
        properties:
          node:
            properties:        
              name:
                type: keyword
              rampUp:
                type: integer
              userCount:
                type: integer 
              statistics:
                properties:
                  transaction:
                    type: keyword
                  sampleCount:
                    type: float
                  errorCount:
                    type: float
                  errorPct:
                    type: float
                  meanResTime:
                    type: float
                  medianResTime:
                    type: float
                  minResTime:
                    type: float
                  maxResTime:
                    type: float
                  pct1ResTime:
                    type: float
                  pct2ResTime:
                    type: float
                  pct3ResTime:
                    type: float
                  throughput:
                    type: float
                  receivedKBytesPerSec:
                    type: float
                  sentKBytesPerSec:
                    type: float 
  url:
    type: keyword
`;
export default yaml;
