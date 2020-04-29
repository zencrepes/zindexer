import { flags } from '@oclif/command';
import Command from '../base';

export default class Sources extends Command {
  static description = 'Generates a config file is none is present';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    console.log('Startup command executed');
  }
}
