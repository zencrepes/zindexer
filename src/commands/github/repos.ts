import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import ghClient from '../../utils/github/utils/ghClient';
import esGetActiveSources from '../../utils/es/esGetActiveSources';
import FetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';

import chunkArray from '../../utils/misc/chunkArray';
import pushConfig from '../../utils/zencrepes/pushConfig';

import {
  esMapping,
  esSettings,
  fetchNodesById,
  zConfig,
  ingestNodes,
} from '../../components/githubRepos';

import { checkEsIndex, pushEsNodes } from '../../components/esUtils/index';

const sleep = (ms: number) => {
  //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
  // tslint:disable-next-line no-string-based-set-timeout
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default class Repos extends Command {
  static description = 'Github: Fetches repos data from configured sources';

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
    const { flags } = this.parse(Repos);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubPullrequests,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');
    const githubChunks = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    const fetchData = new FetchNodesByIds(
      this.log,
      userConfig.github.fetch.maxNodes,
      cli,
      fetchNodesById,
      gClient,
    );
    let fetchedRepos: Array<any> = [];
    for (const githubChunk of githubChunks) {
      cli.action.start(
        'Loading  ' +
          githubChunk.length +
          ' repos from GitHub (' +
          (fetchedRepos.length + githubChunk.length) +
          ' / ' +
          sources.length +
          ')',
      );
      const updatedData = await fetchData.load(githubChunk);
      fetchedRepos = [...fetchedRepos, ...updatedData];
      //Wait for 1 second between all repos fetch
      await sleep(1000);
      cli.action.stop(' done');
    }

    fetchedRepos = ingestNodes(fetchedRepos, 'zindexer');

    const esIndex = userConfig.elasticsearch.dataIndices.githubRepos;
    // Check if index exists, create it if it does not
    await checkEsIndex(eClient, esIndex, esMapping, esSettings, this.log);
    await pushEsNodes(eClient, esIndex, fetchedRepos, this.log);
  }
}
