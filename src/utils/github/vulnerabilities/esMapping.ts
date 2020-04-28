const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  createdAt:
    type: date 
  dismissReason:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256   
  dismissedAt:
    type: date   
  dismissedAfter:
    type: long      
  dismisser:
    properties:
      avatarUrl:
        type: keyword
      login:
        type: keyword
      url:
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
  vulnerableManifestPath:
    type: keyword
  vulnerableManifestFilename:
    type: keyword
  vulnerableRequirements:
    type: keyword    
  securityVulnerability:
    properties:
      updatedAt:
        type: date
      advisory:
        properties:
          id:
            type: keyword
          publishedAt:
            type: date
          origin:
            type: keyword
          summary:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          description:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          severity:
            type: keyword
          ghsaId:
            type: keyword
          permalink:
            type: keyword
      firstPatchedVersion:
        properties:
          identifier:
            type: keyword     
      package:
        properties:
          ecosystem:
            type: keyword   
          name:
            type: keyword   
      severity:
        type: keyword   
      vulnerableVersionRange:
        type: keyword                                             
`;
export default yaml;
