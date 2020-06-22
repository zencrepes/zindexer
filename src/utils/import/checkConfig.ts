import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as path from 'path';

import defaultImportConfig from './defaultImportConfig';
import ImportConfig from './importConfig.type';

const checkConfig = async (config: any, log: any) => {
  const importConfig: ImportConfig = defaultImportConfig;

  // Ensure index exists in Elasticsearch
  // If config file does not exists, initialize it:
  fse.ensureDirSync(config.configDir);
  fse.ensureDirSync(config.configDir + '/cache/');

  if (!fs.existsSync(path.join(config.configDir, 'import-config.yml'))) {
    fs.writeFileSync(
      path.join(config.configDir, 'import-config.yml'),
      jsYaml.safeDump(importConfig),
    );
    log(
      'Initialized configuration file with defaults in: ' +
        path.join(config.configDir, 'import-config.yml'),
    );
    log('Please EDIT the configuration file first');
  } else {
    log(
      'Configuration file exists: ' +
        path.join(config.configDir, 'import-config.yml'),
    );
  }
};

export default checkConfig;
