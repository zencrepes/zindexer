import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import ghClient from '../../utils/github/utils/ghClient';
import esGetActiveSources from '../../utils/es/esGetActiveSources';
import FetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';
import FetchNodesByIdsWithParams from '../../utils/github/utils/fetchNodesByIdsWithParams';

import chunkArray from '../../utils/misc/chunkArray';
import pushConfig from '../../utils/zencrepes/pushConfig';

import {
  esMapping,
  esSettings,
  fetchNodesById,
  fetchPoms,
  zConfig,
  ingestNodes,
} from '../../components/githubMavenPoms';

import { checkEsIndex, pushEsNodes } from '../../components/esUtils/index';

const sleep = (ms: number) => {
  //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
  // tslint:disable-next-line no-string-based-set-timeout
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default class Repos extends Command {
  static description = 'Github: Fetches maven data from repositories default branch';

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
      userConfig.elasticsearch.dataIndices.githubMavenPoms,
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

    // Begin by fetching all repors and getting their defaultBranchRef
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
          ' repos (for maven analysis) from GitHub (' +
          (fetchedRepos.length + githubChunk.length) +
          ' / ' +
          sources.length +
          ')',
      );
      const updatedData = await fetchData.load(githubChunk);
      const repoNames = updatedData.map((r: any) => r.nameWithOwner)
      this.log(`Fetched repos: ${JSON.stringify(repoNames)}`)
      fetchedRepos = [...fetchedRepos, ...updatedData];
      //Wait for 1 second between all repos fetch
      await sleep(1000);
      cli.action.stop(' done');
    }

    // Group repositories by default branch
    const grouppedRepos = fetchedRepos.reduce((acc, repo) => {
      // If default branch is null, default to master
      const branchName = repo.defaultBranchRef === null ? 'master' : repo.defaultBranchRef.name
      // Look for existing record in the accumulator
      const existingBranch = acc.find((a: any) => a.branch === branchName)
      if ( existingBranch === undefined) {
        acc.push({branch: branchName, repos: [repo]})
        return acc
      } else {
        // If the branch already exists, add to the accumulator
        return [...acc.filter((r: any) => r.branch !== branchName), ...[{branch: branchName, repos: [...existingBranch.repos, ...[repo]]}]]
      }
    }, [])


    const fetchPomsData = new FetchNodesByIdsWithParams(
      this.log,
      userConfig.github.fetch.maxNodes,
      cli,
      fetchPoms,
      gClient,
    );
    let fetchedPoms: Array<any> = [];
    for (const branch of grouppedRepos) {
      this.log(`Fetching pom.xml for branch: ${branch.branch}`)
      const githubChunks = await chunkArray(
        branch.repos,
        userConfig.github.fetch.maxNodes,
      );
      for (const githubChunk of githubChunks) {
        cli.action.start(
          'Loading  ' +
            githubChunk.length +
            ' poms (for maven analysis) from GitHub',
        );
        const updatedData = await fetchPomsData.load({nodesArray: githubChunk.map((r) => r.id), branchName: branch.branch, expression: `${branch.branch}:pom.xml`});
        const repoNames = githubChunk.map((r: any) => r.nameWithOwner)
        this.log(`Fetched Maven data from repos: ${JSON.stringify(repoNames)}`)
        fetchedPoms = [...fetchedPoms, ...updatedData];
        //Wait for 1 second between all repos fetch
        await sleep(1000);
        cli.action.stop(' done');
      }
    }

    // Concatenate the two arrays by repo id
    const reposWithPom = fetchedRepos.map((repo) => {
      return {
        ...repo,
        ...fetchedPoms.find((r) => r.id === repo.id)
      }
    })

    fetchedRepos = ingestNodes(reposWithPom, 'zindexer');

    const esIndex = userConfig.elasticsearch.dataIndices.githubMavenPoms;
    // Check if index exists, create it if it does not
    await checkEsIndex(eClient, esIndex, esMapping, esSettings, this.log);
    await pushEsNodes(eClient, esIndex, fetchedRepos, this.log);
  }
}
