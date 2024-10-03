//https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
const chunkArray = (srcArray: Array<any>, chunkSize: number) => {
  let idx = 0;
  const tmpArray = [];
  for (idx = 0; idx < srcArray.length; idx += chunkSize) {
    tmpArray.push(srcArray.slice(idx, idx + chunkSize));
  }
  return tmpArray;
};

interface GithubNode {
  id: string;
  updatedAt: string;
}

const pushEsNodes = async (
  esClient: any, // eslint-disable-line
  nodesIndex: string,
  fetchedNodes: Array<object>,
  logger: Function,
  silent: boolean = false,
) => {
  const esPayloadChunked = await chunkArray(fetchedNodes, 100);
  // Push the data back to elasticsearch
  for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
    if (!silent) {
      logger(
        'Submitting data to ElasticSearch (' +
          (idx + 1) +
          ' / ' +
          esPayloadChunked.length +
          ')',
      );
    }
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
  }
};

export default pushEsNodes;
