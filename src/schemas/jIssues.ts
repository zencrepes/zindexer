const yaml = `
#https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-size-usage.html
_source:
  enabled: true
properties:
  fields:
    properties:
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
          emailAddress:
            type: keyword
          key:
            type: keyword
          name:
            type: keyword
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
          emailAddress:
            type: keyword
          key:
            type: keyword
          name:
            type: keyword
          timeZone:
            type: keyword
      description:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      issuelinks:
        properties:
          id:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
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
                      subtask:
                        type: boolean
                  priority:
                    properties:
                      iconUrl:
                        type: keyword
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
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          name:
            type: keyword
          subtask:
            type: boolean
      lastViewed:
        type: date
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
                  subtask:
                    type: boolean
              priority:
                properties:
                  iconUrl:
                    type: keyword
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
      priority:
        properties:
          iconUrl:
            type: keyword
          id:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          name:
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
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          key:
            type: keyword
          name:
            type: keyword
          projectCategory:
            properties:
              name:
                type: keyword
          projectTypeKey:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
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
          emailAddress:
            type: keyword
          key:
            type: keyword
          name:
            type: keyword
          timeZone:
            type: keyword
      resolution:
        properties:
          description:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          descripton:
            type: text
          id:
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          name:
            type: keyword
      resolutiondate:
        type: date
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
            type: text
            fields:
              keyword:
                type: keyword
                ignore_above: 256
          name:
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
                type: keyword
      subtasks:
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
                  subtask:
                    type: boolean
              priority:
                properties:
                  iconUrl:
                    type: keyword
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
      summary:
        type: text
        fields:
          keyword:
            type: keyword
            ignore_above: 256
      updated:
        type: date
      votes:
        properties:
          hasVoted:
            type: boolean
          votes:
            type: long
      watches:
        properties:
          isWatching:
            type: boolean
          watchCount:
            type: integer
      workratio:
        type: long
  id:
    type: keyword
  key:
    type: keyword
`;
export default yaml;
