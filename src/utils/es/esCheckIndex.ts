import cli from 'cli-ux';
import { Config } from '../../global';
import * as jsYaml from 'js-yaml';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import YmlSettings from '../../schemas/settings';

const esCheckIndex = async (
  client: Client,
  userConfig: Config,
  index: string,
  YmlMapping: string,
) => {
  cli.action.start('Checking if index: ' + index + ' exists');
  const healthCheck: ApiResponse = await client.cluster.health();
  if (healthCheck.body.status === 'red') {
    console.log('Elasticsearch cluster is not in an healthy state, exiting');
    console.log(healthCheck.body);
    process.exit(1);
  }
  const testIndex = await client.indices.exists({ index: index });
  if (testIndex.body === false) {
    cli.action.start('Elasticsearch Index gh_repos does not exist, creating');
    const mappings = await jsYaml.safeLoad(YmlMapping);
    const settings = await jsYaml.safeLoad(YmlSettings);
    //const mappings = await loadYamlFile(__dirname + '../schemas/repositories.yml')
    //const settings = await loadYamlFile(__dirname + '../schemas/settings.yml')
    await client.indices.create({
      index: index,
      body: { settings, mappings },
    });
  }
  cli.action.stop(' done');
};

export default esCheckIndex;