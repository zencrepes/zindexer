//https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/auth-reference.html
import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';

import { ConfigElasticsearch } from '../../global';

const hasValue = (value: string | undefined | null): value is string =>
  value !== undefined && value !== null && value !== '';

function esClient(configElasticsearch: ConfigElasticsearch) {
  const { host, sslCa, sslVerify, cloudId, username, password } =
    configElasticsearch;
  const hasCredentials = hasValue(username) && hasValue(password);
  if (hasValue(cloudId) && hasCredentials) {
    return new Client({
      cloud: {
        id: cloudId,
        username: username,
        password: password,
      },
    });
  }
  // Basic authentication against a regular host
  const auth = hasCredentials ? { auth: { username, password } } : {};
  // Certificate options: a custom CA, and/or accepting a self-signed
  // certificate with sslVerify: false
  const ssl =
    hasValue(sslCa) || sslVerify === false
      ? {
          ssl: {
            ...(hasValue(sslCa) ? { ca: fs.readFileSync(sslCa) } : {}),
            rejectUnauthorized: sslVerify !== false,
          },
        }
      : {};
  return new Client({ node: host, ...auth, ...ssl });
}
export default esClient;
