import cli from 'cli-ux';
import { Client } from '@elastic/elasticsearch';

const fetchAllForProject = async (
  esClient: Client,
  esIndex: string,
  sourceId: string,
) => {
  let issues: any[] = [];

  const scrollSearch = esClient.helpers.scrollSearch({
    index: esIndex,
    body: {
      query: {
        match: {
          zindexerSourceId: {
            query: sourceId,
          },
        },
      },
    },
  });
  cli.action.start(
    'Fetching all issues from source: ' + sourceId + ' in index: ' + esIndex,
  );

  for await (const result of scrollSearch) {
    issues = [...issues, ...result.documents];
  }
  cli.action.stop('done (' + issues.length + ' issues fetched)');

  return issues;
};
export default fetchAllForProject;
