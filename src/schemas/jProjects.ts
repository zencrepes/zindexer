const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  archived:
    type: boolean
  assigneeType:
    type: keyword
  components:
    properties:
      id:
        type: keyword
      isAssigneeTypeValid:
        type: boolean
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      self:
        type: keyword
  description:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  email:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  expand:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
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
      self:
        type: keyword
      subtask:
        type: boolean
  key:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  lead:
    properties:
      active:
        type: boolean
      displayName:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      key:
        type: keyword
      name:
        type: keyword
      self:
        type: keyword
  name:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  nodeId:
    type: keyword
  notificationsScheme:
    properties:
      description:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      expand:
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
      self:
        type: keyword
  permissionsScheme:
    properties:
      expand:
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
      self:
        type: keyword
  priorityScheme:
    properties:
      defaultOptionId:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      defaultScheme:
        type: boolean
      expand:
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
      optionIds:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      self:
        type: keyword
  projectCategory:
    properties:
      description:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      id:
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
      self:
        type: keyword
  projectTypeKey:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  properties:
    type: object
  roles:
    properties:
      actors:
        properties:
          avatarUrl:
            type: keyword
          displayName:
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
          type:
            type: keyword
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
      self:
        type: keyword
  securityLevel:
    type: object
  self:
    type: keyword
  versions:
    properties:
      archived:
        type: boolean
      id:
        type: keyword
      name:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      overdue:
        type: boolean
      projectId:
        type: long
      releaseDate:
        type: date
      released:
        type: boolean
      self:
        type: keyword
      userReleaseDate:
        type: keyword
`;
export default yaml;
