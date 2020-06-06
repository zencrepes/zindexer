const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  dataType:
    type: keyword  
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
  createdAt:
    type: date 
  lastStarredAt:
    type: date
  company:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256  
  email:
    type: keyword    
  login:
    type: keyword
  status:
    type: keyword
  url:
    type: keyword  
  websiteUrl:
    type: keyword      
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256     
  avatarUrl:
    type: keyword 
  isEmployee:
    type: boolean
  isHireable:
    type: boolean
  isDeveloperProgramMember:
    type: boolean
  isCampusExpert:
    type: boolean
  isBountyHunter:
    type: boolean
  followers:
    properties:
      totalCount:
        type: integer
  following:
    properties:
      totalCount:
        type: integer
  repositories:
    properties:
      totalCount:
        type: integer    
      edges:
        type: nested
        properties:
          node:
            properties:        
              databaseId:
                type: long
              id:
                type: keyword
              starredAt:
                type: date            
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
  organizations:
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
              createdAt:
                type: date             
              name:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256 
              login:
                type: keyword
              avatarUrl:
                type: keyword               
              url:
                type: keyword
              email:
                type: keyword                              
              websiteUrl:
                type: keyword                                           
`;
export default yaml;
