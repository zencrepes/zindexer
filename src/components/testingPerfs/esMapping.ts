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
  rampUp:
    type: integer
  verified:
    type: boolean
  verified_date:
    type: date
  verified_by:
    type: keyword
  disabled:
    type: boolean
  disabled_date:
    type: date
  disabled_by:
    type: keyword
  description:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  description_date:
    type: date
  description_by:
    type: keyword
  analysis:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  analysis_date:
    type: date
  analysis_by:
    type: keyword
  platform:
    properties:
      vendor:
        type: keyword
      tenant:
        type: keyword
      region:
        type: keyword   
  transactions:
    properties:
      totalCount:
        type: integer    
      edges:
        type: nested
        properties:
          node:
            properties:        
              id:
                type: keyword
              name:
                type: keyword
  tags:
    properties:
      totalCount:
        type: integer    
      edges:
        type: nested
        properties:
          node:
            properties:
              id:
                type: keyword
              name:
                type: keyword
              type:
                type: keyword
              description:
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
              name_size:
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
                type: nested
                properties:
                  transaction:
                    type: keyword
                  sampleCount:
                    type: long
                  errorCount:
                    type: long
                  errorPct:
                    type: double
                  meanResTime:
                    type: double
                  medianResTime:
                    type: double
                  minResTime:
                    type: double
                  maxResTime:
                    type: double
                  pct1ResTime:
                    type: double
                  pct2ResTime:
                    type: double
                  pct3ResTime:
                    type: double
                  throughput:
                    type: double
                  receivedKBytesPerSec:
                    type: double
                  sentKBytesPerSec:
                    type: double 
  url:
    type: keyword
`;
export default yaml;
