import cli from 'cli-ux';

import { GithubNode } from '../../global';

import chunkArray from '../../utils/misc/chunkArray';

const esPushNodes = async (
  fetchedNodes: Array<object>,
  nodesIndex: string,
  esClient: any, // eslint-disable-line
) => {
  const esPayloadChunked = await chunkArray(fetchedNodes, 100);
  // Push the data back to elasticsearch
  for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
    cli.action.start(
      'Submitting data to ElasticSearch (' +
        (idx + 1) +
        ' / ' +
        esPayloadChunked.length +
        ')',
    );
    let formattedData = '';
    for (const rec of esPayloadChunk) {
      formattedData =
        formattedData +
        JSON.stringify({
          index: {
            _index: nodesIndex,
            _id: (rec as GithubNode).id,
          },
        }) +
        '\n' +
        JSON.stringify(rec) +
        '\n';
    }
    await esClient.bulk({
      index: nodesIndex,
      refresh: 'wait_for',
      body: formattedData,
    });
    cli.action.stop(' done');
  }
};

export default esPushNodes;
