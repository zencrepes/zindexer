import cli from 'cli-ux';
import { Client } from '@elastic/elasticsearch';

const fetchAllLabels = async (esClient: Client, esIndex: string) => {
  let labels: any[] = [];

  const scrollSearch = esClient.helpers.scrollSearch({
    index: esIndex,
    body: {
      query: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        match_all: {},
      },
    },
  });
  cli.action.start('Fetching all labels from: ' + esIndex);

  for await (const result of scrollSearch) {
    labels = [...labels, ...result.documents];
  }
  cli.action.stop('done (' + labels.length + ' labels fetched)');

  return labels;
};
export default fetchAllLabels;
