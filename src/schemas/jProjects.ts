const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  archived:
    type: boolean
  assigneeType:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  avatarUrls:
    properties:
      16x16:
        type: keyword
      24x24:
        type: keyword
      32x32:
        type: keyword
      48x48:
        type: keyword
  description:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  fields:
    properties:
      assignee:
        properties:
          active:
            type: boolean
          displayName:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          emailAddress:
            type: keyword
          key:
            type: keyword
          name:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          timeZone:
            type: keyword
      components:
        type: nested
        properties:
          name:
            type: keyword
      created:
        type: date
      creator:
        properties:
          active:
            type: boolean
          displayName:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          emailAddress:
            type: keyword
          key:
            type: keyword
          name:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          timeZone:
            type: keyword
      issuetype:
        properties:
          name:
            type: keyword
      priority:
        properties:
          name:
            type: keyword
      project:
        properties:
          key:
            type: keyword
          name:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          projectCategory:
            properties:
              name:
                type: keyword
      reporter:
        properties:
          active:
            type: boolean
          displayName:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          emailAddress:
            type: keyword
          key:
            type: keyword
          name:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          timeZone:
            type: keyword
      resolution:
        properties:
          descripton:
            type: text
          name:
            type: keyword
      resolutiondate:
        type: date
      status:
        properties:
          name:
            type: keyword
          statusCategory:
            properties:
              key:
                type: keyword
              name:
                type: keyword
      updated:
        type: date
      watches:
        properties:
          watchCount:
            type: integer
  id:
    type: keyword
  issueTypes:
    properties:
      avatarId:
        type: long
      description:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      iconUrl:
        type: keyword
      id:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      subtask:
        type: boolean
  key:
    type: keyword
  lead:
    properties:
      active:
        type: boolean
      avatarUrls:
        properties:
          16x16:
            type: keyword
          24x24:
            type: keyword
          32x32:
            type: keyword
          48x48:
            type: keyword
      displayName:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      key:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  notificationsScheme:
    properties:
      description:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      id:
        type: long
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
  permissionsScheme:
    properties:
      id:
        type: long
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
  priorityScheme:
    properties:
      defaultOptionId:
        type: keyword
      defaultScheme:
        type: boolean
      id:
        type: long
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      optionIds:
        type: keyword
  projectTypeKey:
    type: keyword
  properties:
    type: object
  roles:
    properties:
      Administrators:
        type: keyword
      Assignable:
        type: keyword
      Contributors:
        type: keyword
      Email:
        type: keyword
      External developers:
        type: keyword
      Jahia employees:
        type: keyword
      Tempo Project Managers:
        type: keyword
      Users:
        type: keyword
  securityLevel:
    type: object
`;
export default yaml;
