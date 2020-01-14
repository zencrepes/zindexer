//https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/auth-reference.html
import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';

import { ConfigElasticsearch } from '../../global';

function esClient(configElasticsearch: ConfigElasticsearch) {
  const { host, sslCa, cloudId, username, password } = configElasticsearch;
  console.log(configElasticsearch);
  if (
    cloudId !== undefined &&
    cloudId !== null &&
    cloudId !== '' &&
    username !== undefined &&
    username !== null &&
    username !== '' &&
    password !== undefined &&
    password !== null &&
    password !== ''
  ) {
    return new Client({
      cloud: {
        id: cloudId,
        username: username,
        password: password,
      },
    });
  } else if (sslCa !== undefined && sslCa !== null && sslCa !== '') {
    return new Client({
      node: host,
      ssl: {
        ca: fs.readFileSync(sslCa),
      },
    });
  } else {
    console.log(host);
    return new Client({
      node: host,
    });
  }
}
export default esClient;
