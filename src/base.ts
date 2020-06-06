import Command from '@oclif/command';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import { Config } from './global';
import { defaultConfig } from './components/config/index';

export default abstract class extends Command {
  userConfig = defaultConfig;

  setUserConfig(userConfig: Config) {
    this.userConfig = userConfig;
  }

  async init() {
    if (process.env.CONFIG_DIR !== undefined) {
      this.config.configDir = process.env.CONFIG_DIR;
    }
    // If config file does not exists, initialize it:
    fse.ensureDirSync(this.config.configDir);
    fse.ensureDirSync(this.config.configDir + '/cache/');

    if (!fs.existsSync(path.join(this.config.configDir, 'config.yml'))) {
      fs.writeFileSync(
        path.join(this.config.configDir, 'config.yml'),
        jsYaml.safeDump(this.userConfig),
      );
      this.log(
        'Initialized configuration file with defaults in: ' +
          path.join(this.config.configDir, 'config.yml'),
      );
      this.log('Please EDIT the configuration file first');
      this.exit();
    } else {
      this.log(
        'Configuration file exists: ' +
          path.join(this.config.configDir, 'config.yml'),
      );

      const userConfig = await loadYamlFile(
        path.join(this.config.configDir, 'config.yml'),
      );
      this.setUserConfig(userConfig);
    }
  }
}
