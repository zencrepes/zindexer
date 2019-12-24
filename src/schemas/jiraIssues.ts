const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  fields:
    properties:
      components:
        type: nested
        properties:
          name: 
            type: keyword
      assignee:
        properties:
          name:
            type: keyword
          key:
            type: keyword
          emailAddress: 
            type: keyword
          displayName:
            type: text
          active:
            type: boolean
          timeZone:
            type: keyword
      creator:
        properties:
          name:
            type: keyword
          key:
            type: keyword
          emailAddress: 
            type: keyword
          displayName:
            type: text
          active:
            type: boolean
          timeZone:
            type: keyword 
      reporter:
        properties:
          name:
            type: keyword
          key:
            type: keyword
          emailAddress: 
            type: keyword
          displayName:
            type: text
          active:
            type: boolean
          timeZone:
            type: keyword                       
      issuetype: 
        properties:
          name:
            type: keyword
      project:
        properties:
          name: 
            type: keyword
          key:
            type: keyword
          projectCategory:
            properties:
              name:
                type: keyword
      resolution:
        properties:
          descripton:
            type: text
          name:
            type: keyword
      created:
        type: date
      resolutiondate:
        type: date
      updated:
        type: date
      watches:
        properties:
          watchCount:
            type: integer
      priority:
        properties:
          name:
            type: keyword
      status:
        properties:
          name: 
            type: keyword
          statusCategory:
            properties:
              name: 
                type: keyword
              key:
                type: keyword
`;
export default yaml;
