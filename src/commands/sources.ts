import { flags } from '@oclif/command';
import Command from '../base';

export default class Sources extends Command {
  static description = 'Manage sources of data';

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    type: flags.string({
      char: 't',
      options: ['JIRA', 'GITHUB'],
      description: 'Type of source (JIRA or GitHUB)',
    }),
    active: flags.boolean({
      char: 'a',
      default: false,
      description: 'Automatically make the new sources active by default',
    }),
    ggrab: flags.string({
      char: 'g',
      default: 'affiliated',
      options: ['affiliated', 'org', 'repo'],
      description: 'If Github, Select how to fetch repositories',
    }),
    gorg: flags.string({
      char: 'o',
      required: false,
      description: 'If Github, organization login',
    }),
    grepo: flags.string({
      char: 'r',
      required: false,
      description: 'If Github, repository name',
    }),
    jserver: flags.string({
      char: 'j',
      description: 'If Jira, Server name (from config) to fetch data from',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { args, flags } = this.parse(Sources);
    const userConfig = this.userConfig;
    console.log(userConfig);
  }
}
