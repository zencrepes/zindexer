const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  id:
    type: keyword
  key:
    type: keyword    
  closedAt:
    type: date
  createdAt:
    type: date
  updatedAt:
    type: date
  endOfSupport:
    type: date      
  assignee:
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
      emailAddress:
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
      self:
        type: keyword
      timeZone:
        type: keyword
  creator:
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
      emailAddress:
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
      self:
        type: keyword
      timeZone:
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
  dueAt:
    type: date
  environment:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  fixVersions:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              archived:
                type: boolean
              description:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              id:
                type: keyword
              name:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              releaseDate:
                type: date
              released:
                type: boolean
              self:
                type: keyword
      totalCount:
        type: long
  comments:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              id:
                type: keyword
              self:
                type: keyword
              body:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256 
              created:
                type: date
              updated:
                type: date    
              author:
                properties:
                  active:
                    type: boolean
                  avatarUrls:
                    properties:
                      xsmall:
                        type: keyword
                      small:
                        type: keyword
                      medium:
                        type: keyword
                      large:
                        type: keyword
                  displayName:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
                  emailAddress:
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
                  self:
                    type: keyword
                  timeZone:
                    type: keyword
              updateAuthor:
                properties:
                  active:
                    type: boolean
                  avatarUrls:
                    properties:
                      xsmall:
                        type: keyword
                      small:
                        type: keyword
                      medium:
                        type: keyword
                      large:
                        type: keyword
                  displayName:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
                  emailAddress:
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
                  self:
                    type: keyword
                  timeZone:
                    type: keyword
      totalCount:
        type: long
  issuelinks:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              id:
                type: keyword
              inwardIssue:
                properties:
                  fields:
                    properties:
                      issuetype:
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
                      priority:
                        properties:
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
                      status:
                        properties:
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
                          statusCategory:
                            properties:
                              colorName:
                                type: keyword
                              id:
                                type: keyword
                              key:
                                type: keyword
                              name:
                                type: text
                                fields:
                                  keyword:
                                    type: keyword
                                    ignore_above: 256
                              self:
                                type: keyword
                      summary:
                        type: text
                        fields:
                          keyword:
                            type: keyword
                            ignore_above: 256
                  id:
                    type: keyword
                  key:
                    type: keyword
                  self:
                    type: keyword
              outwardIssue:
                properties:
                  fields:
                    properties:
                      issuetype:
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
                      priority:
                        properties:
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
                      status:
                        properties:
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
                          statusCategory:
                            properties:
                              colorName:
                                type: text
                                fields:
                                  keyword:
                                    type: keyword
                                    ignore_above: 256
                              id:
                                type: long
                              key:
                                type: keyword
                              name:
                                type: text
                                fields:
                                  keyword:
                                    type: keyword
                                    ignore_above: 256
                              self:
                                type: keyword
                      summary:
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
                  key:
                    type: keyword
                  self:
                    type: keyword
              self:
                type: keyword
              type:
                properties:
                  id:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
                  inward:
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
                  outward:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
                  self:
                    type: keyword
      totalCount:
        type: long
  remoteLinks:
    properties:
      edges:
        type: nested
        properties:
          node:
            properties:
              key:
                type: keyword
              points:
                type: long
              closedAt:
                type: date
              createdAt:
                type: date
              updatedAt:
                type: date
              summary:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256       
              remoteLink:
                properties:                  
                  url:
                    type: keyword
                  title:
                    type: keyword
      totalCount:
        type: long
  parent:
    properties:
      fields:
        properties:
          issuetype:
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
          priority:
            properties:
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
          status:
            properties:
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
              statusCategory:
                properties:
                  colorName:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
                  id:
                    type: long
                  key:
                    type: keyword
                  name:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
                  self:
                    type: keyword
          summary:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
      id:
        type: keyword
      key:
        type: keyword
      self:
        type: keyword
  parentEpic:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  points:
    type: long
  priority:
    properties:
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
  project:
    properties:
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
      id:
        type: keyword
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
          description:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
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
      projectTypeKey:
        type: keyword
      self:
        type: keyword
  reporter:
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
      emailAddress:
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
      self:
        type: keyword
      timeZone:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
  resolution:
    properties:
      description:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
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
  status:
    properties:
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
      statusCategory:
        properties:
          colorName:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          id:
            type: long
          key:
            type: keyword
          name:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          self:
            type: keyword
  subtasks:
    properties:
      edges:
        properties:
          node:
            properties:
              fields:
                properties:
                  issuetype:
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
                        type: text
                        fields:
                          keyword:
                            type: keyword
                            ignore_above: 256
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
                  priority:
                    properties:
                      iconUrl:
                        type: text
                        fields:
                          keyword:
                            type: keyword
                            ignore_above: 256
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
                  status:
                    properties:
                      description:
                        type: text
                        fields:
                          keyword:
                            type: keyword
                            ignore_above: 256
                      iconUrl:
                        type: text
                        fields:
                          keyword:
                            type: keyword
                            ignore_above: 256
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
                      statusCategory:
                        properties:
                          colorName:
                            type: text
                            fields:
                              keyword:
                                type: keyword
                                ignore_above: 256
                          id:
                            type: long
                          key:
                            type: keyword
                          name:
                            type: text
                            fields:
                              keyword:
                                type: keyword
                                ignore_above: 256
                          self:
                            type: keyword
                  summary:
                    type: text
                    fields:
                      keyword:
                        type: keyword
                        ignore_above: 256
              id:
                type: keyword
              key:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              self:
                type: keyword
      totalCount:
        type: long
  summary:
    type: text
    fields:
      keyword:
        type: keyword
        ignore_above: 256
  versions:
    properties:
      edges:
        properties:
          node:
            properties:
              archived:
                type: boolean
              description:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              id:
                type: keyword
              name:
                type: text
                fields:
                  keyword:
                    type: keyword
                    ignore_above: 256
              releaseDate:
                type: date
              released:
                type: boolean
              self:
                type: keyword
      totalCount:
        type: long
  watches:
    properties:
      isWatching:
        type: boolean
      self:
        type: keyword
      watchCount:
        type: long



`;
export default yaml;
