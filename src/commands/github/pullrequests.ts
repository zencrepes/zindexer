import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import esGithubLatest from '../../utils/es/esGithubLatest';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import esCheckIndex from '../../utils/es/esCheckIndex';

import { getId } from '../../utils/misc/getId';

import esMapping from '../../utils/github/pullrequests/esMapping';
import fetchGql from '../../utils/github/pullrequests/fetchGql';

import esMappingConfig from '../../utils/mappings/config';
import zConfig from '../../utils/github/pullrequests/zConfig';

import { differenceInDays } from 'date-fns';
import fetchConfig from '../../utils/zencrepes/fetchConfig';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Pullrequests extends Command {
  static description =
    'Github: Fetches Pullrequests data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesUpdated(
      gClient,
      fetchGql,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currentSource of sources) {
      let pullrequestsIndex =
        userConfig.elasticsearch.dataIndices.githubPullrequests;

      this.log('Processing source: ' + currentSource.name);
      const recentPullrequest = await esGithubLatest(
        eClient,
        pullrequestsIndex,
        currentSource.id,
      );
      cli.action.start(
        'Grabbing pullrequests for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedPullrequests = await fetchData.load(
        currentSource.id,
        recentPullrequest,
      );
      cli.action.stop(' done');

      // Some data manipulation on all items
      fetchedPullrequests = fetchedPullrequests.map((item: any) => {
        let openedDuring = null;
        if (item.closedAt !== null) {
          openedDuring = differenceInDays(
            new Date(item.closedAt),
            new Date(item.createdAt),
          );
        }
        return {
          ...item,
          zindexer_sourceid: currentSource.id,
          openedDuring: openedDuring,
        };
      });

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        pullrequestsIndex = (
          userConfig.elasticsearch.dataIndices.githubPullrequests +
          getId(currentSource.name)
        ).toLocaleLowerCase();
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, pullrequestsIndex, esMapping);

      // Push all nodes to the index
      await esPushNodes(fetchedPullrequests, pullrequestsIndex, eClient);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // If one index per source, then an alias is created automatically to all of the indices
        // Create an alias used for group querying
        cli.action.start(
          'Creating the Elasticsearch index alias: ' +
            userConfig.elasticsearch.dataIndices.githubPullrequests,
        );
        await eClient.indices.putAlias({
          index: userConfig.elasticsearch.dataIndices.githubPullrequests + '*',
          name: userConfig.elasticsearch.dataIndices.githubPullrequests,
        });
        cli.action.stop(' done');
      }
    }

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubPullrequests,
    );
    // const configIndex = userConfig.elasticsearch.sysIndices.config;
    // cli.action.start(
    //   'Pushing ZenCrepes UI default configuration: ' + configIndex,
    // );
    // await esCheckIndex(eClient, userConfig, configIndex, esMappingConfig);
    // const existingConfig = await fetchConfig(eClient, userConfig);
    // console.log(existingConfig);
    // if (existingConfig.find((c: any) => c.id === zConfig.id) === undefined) {
    //   await esPushNodes(
    //     [
    //       {
    //         ...zConfig,
    //         esIndex: userConfig.elasticsearch.dataIndices.githubPullrequests,
    //       },
    //     ],
    //     configIndex,
    //     eClient,
    //   );
    // } else {
    //   console.log('Config already present, skipping...');
    // }
    // cli.action.stop(' done');
  }
}
