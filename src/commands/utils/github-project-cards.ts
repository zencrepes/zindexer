import { flags } from '@oclif/command';
import * as fs from 'fs';
import { createWriteStream } from 'fs';
import asciitable from 'asciitable.js';

import Command from '../../base';
import { TimelineProject } from '../../global';
import esClient from '../../utils/es/esClient';
import esGetCardEventsSinceDate from '../../utils/es/esGetCardEventsSinceDate';
import esGetCardEventsForContentId from '../../utils/es/esGetCardEventsForContentId';
import esGetIssue from '../../utils/es/esGetIssue';
import esGetPr from '../../utils/es/esGetPr';
import esGetProject from '../../utils/es/esGetProject';
import sleep from '../../utils/misc/sleep';
import * as path from 'path';

// Format the changes into a human readable string for the ascii table
const handleChanges = (action: string, change: any) => {
  if (action === 'created') {
    return 'Issue added to project';
  }
  if (action === 'deleted') {
    return 'Issue removed from project';
  }
  if (change === undefined || change.field_value === undefined) {
    return JSON.stringify(change);
  }
  if (
    change.field_value.to === undefined &&
    change.field_value.from === undefined
  ) {
    return `Modified field: "${change.field_value.field_name}"`;
  }
  if (
    change.field_value.to !== undefined &&
    change.field_value.from !== undefined
  ) {
    return `Modified field "${change.field_value.field_name}": ${
      change.field_value.from === null ? null : change.field_value.from.name
    } => ${change.field_value.to === null ? null : change.field_value.to.name}`;
  }
  return JSON.stringify(change);
};

export default class ProjectCards extends Command {
  static description =
    'Github: Generate an historical log on events happening on project cards for an issue';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    all: flags.boolean({
      char: 'a',
      default: false,
      description: 'Clear nodes before fetching all of them again',
    }),
    window: flags.integer({
      required: false,
      default: 3000,
      env: 'HISTORY_WINDOW',
      description:
        'Number of minutes to look back for historical data in the projects cards timeline',
    }),
  };

  async run() {
    const { flags } = this.parse(ProjectCards);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    const projectCardsTimelineIndex = `${userConfig.github.webhook.timelinePayload.esIndexPrefix}projects_v2_item`;

    const startDate = new Date(
      Date.now() - flags.window * 60 * 1000,
    ).toISOString();

    const projectCardEvents = await esGetCardEventsSinceDate(
      eClient,
      projectCardsTimelineIndex,
      startDate,
    );

    // Index populated by the webhook and containing issue details
    const issuesGlobalIndex = userConfig.elasticsearch.dataIndices.githubIssues;
    const issueWebhookIndex = `${userConfig.github.webhook.nodePayload.esIndexPrefix}issues`;
    const issueWebhookProjects = `${userConfig.github.webhook.nodePayload.esIndexPrefix}projects_v2`;

    const projects: TimelineProject[] = []; // An array containing projects to avoid having to fetch them multiple times

    const processedIssues: any[] = [];
    for (const content of projectCardEvents) {
      console.log(`Found event for content ID: ${content.id}`);

      if (processedIssues.find(i => i.id === content.id)) {
        console.log(`Issue or PR: ${content.id} already processed, skipping`);
        continue;
      }
      await sleep(250); // To limit load on Elasticsearch

      console.log(
        `Processing content for ID: ${content.id} of type: ${content.type}`,
      );

      let parentContent;
      if (content.type === 'Issue') {
        parentContent = await esGetIssue(
          eClient,
          issueWebhookIndex,
          issuesGlobalIndex,
          content.id,
        );
      } else {
        parentContent = await esGetPr(
          eClient,
          userConfig.elasticsearch.dataIndices.githubPullrequests,
          content.id,
        );
      }

      const events = await esGetCardEventsForContentId(
        eClient,
        projectCardsTimelineIndex,
        content.id,
      );

      const expandedEvents: any[] = [];
      for (const event of events) {
        let project = projects.find(p => p.id === event.project.id);
        if (!project) {
          const fetchedProject = await esGetProject(
            eClient,
            issueWebhookProjects,
            event.project.id,
          );
          if (fetchedProject !== null) {
            project = fetchedProject;
            projects.push(project);
          }
        }
        expandedEvents.push({
          ...event,
          project: {
            ...project,
          },
        });
      }
      processedIssues.push({
        ...content,
        ...parentContent,
        updatedAt: new Date(),
        events: expandedEvents,
      });
    }
    for (const issue of processedIssues.filter(i => i.number !== undefined)) {
      const issuePath = path.join(
        userConfig.github.cardEvents.localPath + '/',
        issue.org,
        issue.repository,
        'txt',
        issue.number + '.txt',
      );
      // Create the directory containing issuePath if it does not exist
      const issueDir = path.dirname(issuePath);
      if (!fs.existsSync(issueDir)) {
        fs.mkdirSync(issueDir, { recursive: true });
      }

      const issueJsonPath = path.join(
        userConfig.github.cardEvents.localPath + '/',
        issue.org,
        issue.repository,
        'json',
        issue.number + '.json',
      );
      const issueJsonDir = path.dirname(issueJsonPath);
      if (!fs.existsSync(issueJsonDir)) {
        fs.mkdirSync(issueJsonDir, { recursive: true });
      }

      const issueStream = createWriteStream(issuePath, { flags: 'w' });
      issueStream.write(`Issue: ${issue.title} (#${issue.number}) \n`);
      issueStream.write(`Repository: ${issue.org}/${issue.repository} \n`);
      issueStream.write(`Last updated: ${issue.updatedAt.toISOString()} \n\n`);
      issueStream.write(`List of events performed by users: \n`);

      const eventsTableHeader = [
        null,
        ['Date', 'Who', 'Action', 'Project', 'Change', 'Event ID'],
        null,
      ];
      const userEventsTable = [];
      const botsEventsTable = [];
      for (const event of issue.events) {
        if (
          ['ghost', 'github-project-automation[bot]'].includes(
            event.sender.login,
          )
        ) {
          botsEventsTable.push([
            event.date,
            event.sender.login,
            event.action,
            `${event.project.title} (#${event.project.number})`,
            handleChanges(event.action, event.change),
            event.id,
          ]);
        } else {
          userEventsTable.push([
            event.date,
            event.sender.login,
            event.action,
            `${event.project.title} (#${event.project.number})`,
            handleChanges(event.action, event.change),
            event.id,
          ]);
        }
      }
      userEventsTable.push(null);
      botsEventsTable.push(null);
      issueStream.write(
        `${asciitable([...eventsTableHeader, ...userEventsTable])}\n\n`,
      );

      issueStream.write(`Other events performed by GitHub internal bots \n`);
      issueStream.write(
        `${asciitable([...eventsTableHeader, ...botsEventsTable])}\n`,
      );
      issueStream.end();

      // Also save the entire issue object as JSON
      fs.writeFileSync(issueJsonPath, JSON.stringify(issue), { flag: 'w' });
      console.log(
        `Wrote ${issue.events.length} events to: ${issuePath} and ${issueJsonPath}`,
      );
    }
  }
}
