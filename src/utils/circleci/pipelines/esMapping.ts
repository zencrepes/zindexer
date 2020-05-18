const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  errors:
    type: nested
    properties:
      type:
        type: keyword
      message:
        type: text
        fields: 
          keyword:
            type: keyword
            ignore_above: 256        
  project_slug:
    type: keyword
  updated_at:
    type: date
  createdAt:
    type: date    
  updatedAt:
    type: date      
  triggeredAt:
    type: date    
  number:
    type: long
  state:
    type: keyword    
  created_at:
    type: date
  trigger:
    properties:
      type:    
        type: keyword
      received_at:
        type: date
      actor:
        properties:
          login:
            type: keyword
          avatar_url:
            type: keyword
  vcs:
    properties:
      provider_name:
        type: keyword
      origin_repository_url:
        type: keyword
      target_repository_url:
        type: keyword
      revision:
        type: keyword
      branch:
        type: text
        fields: 
          keyword:
            type: keyword
            ignore_above: 256  
      tag:
        type: text
        fields: 
          keyword:
            type: keyword
            ignore_above: 256  
      commit:
        properties:
          subject:
            type: text
            fields: 
              keyword:
                type: keyword
                ignore_above: 256
          body:
            type: text
            fields: 
              keyword:
                type: keyword
                ignore_above: 256  
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
      active:
        type: boolean                             
`;
export default yaml;
