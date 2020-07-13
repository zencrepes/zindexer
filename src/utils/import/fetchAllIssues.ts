import cli from 'cli-ux';
import { Client } from '@elastic/elasticsearch';

const fetchAllIssues = async (esClient: Client, esIndex: string) => {
  let issues: any[] = [];

  const scrollSearch = esClient.helpers.scrollSearch({
    index: esIndex,
    body: {
      query: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        match_all: {},
      },
    },
  });
  cli.action.start('Fetching all issues from: ' + esIndex);

  for await (const result of scrollSearch) {
    issues = [...issues, ...result.documents];
  }
  cli.action.stop('done (' + issues.length + ' issues fetched)');

  return issues;
};
export default fetchAllIssues;
