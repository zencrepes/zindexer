import { flags } from '@oclif/command';

import Command from '../../base';
import esClient from '../../utils/es/esClient';

import {
  esMapping,
  esSettings,
  zConfig,
} from '../../components/junitStates';

import {
  checkEsIndex,
} from '../../components/esUtils/index';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class States extends Command {
  static description = 'Junit: Initialize ES indeices for JUnit reports states';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    config: flags.boolean({
      char: 'c',
      default: false,
      description: 'Only update ZenCrepes configuration',
    }),
    reset: flags.boolean({
      char: 'r',
      default: false,
      description: 'Reset ZenCrepes configuration to default',
    }),
  };

  async run() {
    const { flags } = this.parse(States);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.junitStates,
      flags.reset,
    );

    await checkEsIndex(eClient, userConfig.elasticsearch.dataIndices.junitStates, esMapping, esSettings, this.log);


    if (flags.config === true) {
      return;
    }
  }
}
