import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as path from 'path';

import defaultLabelsConfig from './defaultLabelsConfig';
import LabelsConfig from './labelsConfig.type';

const checkConfig = async (config: any, log: any) => {
  const labelsConfig: LabelsConfig = defaultLabelsConfig;

  // Ensure index exists in Elasticsearch
  // If config file does not exists, initialize it:
  fse.ensureDirSync(config.configDir);

  if (!fs.existsSync(path.join(config.configDir, 'labels-config.yml'))) {
    fs.writeFileSync(
      path.join(config.configDir, 'labels-config.yml'),
      jsYaml.safeDump(labelsConfig),
    );
    log(
      'Initialized configuration file with defaults in: ' +
        path.join(config.configDir, 'labels-config.yml'),
    );
    log('Please EDIT the configuration file first');
  } else {
    log(
      'Configuration file exists: ' +
        path.join(config.configDir, 'labels-config.yml'),
    );
  }
};

export default checkConfig;
