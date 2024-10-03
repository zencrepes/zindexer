import { flags } from '@oclif/command';
import cli from 'cli-ux';
import loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import Command from '../../base';
import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
import ghClient from '../../utils/github/utils/ghClient';
import sleep from '../../utils/misc/sleep';

import checkConfig from '../../utils/github/labels/checkConfig';
import { LabelsConfig } from '../../utils/github/labels/labelsConfig.type';
import fetchAllLabels from '../../utils/github/labels/fetchAllLabels';

import GQL_UPDATELABEL from '../../utils/github/labels/updateLabel.graphql';
import GQL_RATELIMIT from '../../utils/import/getRateLimit.graphql';

import esClient from '../../utils/es/esClient';
import esGetActiveSources from '../../utils/es/esGetActiveSources';

import {
  esMapping,
  esSettings,
  fetchNodes,
  zConfig,
  ingestNodes,
} from '../../components/githubLabels';

import {
  getEsIndex,
  checkEsIndex,
  pushEsNodes,
  aliasEsIndex,
} from '../../components/esUtils/index';

import pushConfig from '../../utils/zencrepes/pushConfig';

const findLabelConfig = (labelsConfig: LabelsConfig, label: any) => {
  const configFound = labelsConfig.labels.find((l) => {
    if (l.exactMatch === true && l.name === label.name) {
      return true;
    } else if (l.exactMatch === false && label.name.includes(l.name)) {
      return true;
    }
    return false;
  });
  return configFound;
};

const checkRateLimit = async (rateLimit: any) => {
  const resetAt = rateLimit.resetAt;
  const remainingTokens = rateLimit.remaining;
  if (remainingTokens <= 105 && resetAt !== null) {
    console.log(
      'Exhausted all available tokens, will resuming querying after ' +
        new Date(resetAt * 1000),
    );
    const sleepDuration =
      new Date(resetAt * 1000).getTime() - new Date().getTime();
    console.log('Will resume querying in: ' + sleepDuration + 's');
    await sleep(sleepDuration + 10000);
    console.log('Ready to resume querying');
  }
};

export default class Labels extends Command {
  static description = 'Github: Fetches labels attached to configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    updateLabels: flags.boolean({
      char: 'u',
      default: false,
      description: 'Updates labels based on the provided configuration',
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
    const { flags } = this.parse(Labels);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubLabels,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    if (flags.updateLabels === true) {
      this.log('Update labels in bulk');
      await checkConfig(this.config, this.log);
      const labelsConfig: LabelsConfig = await loadYamlFile(
        path.join(this.config.configDir, 'labels-config.yml'),
      );

      this.log('Grab existing labels from Elasticsearch');
      const labelsIndex = userConfig.elasticsearch.dataIndices.githubLabels;
      const labels: any[] = await fetchAllLabels(eClient, labelsIndex);

      // Loop in existing labels to identify if they need to be updated
      let data: any = {}; // eslint-disable-line
      const labelsToUpdate = labels.reduce((acc, label) => {
        const configFound = findLabelConfig(labelsConfig, label);
        if (configFound !== undefined) {
          const modifiedFields = []
          if (label.description !== configFound.description) {
            this.debug(`   Description: ${label.description} -> ${configFound.description}`);            
            label = {
              ...label,
              description: configFound.description,
            };
            modifiedFields.push("description");
          }
          if (label.color !== configFound.color.toLocaleLowerCase()) {
            this.debug(`   Color: ${label.color} -> ${configFound.color.toLocaleLowerCase()}`);            
            label = {
              ...label,
              color: configFound.color.toLocaleLowerCase(),
            };
            modifiedFields.push("color");
          }
          if (modifiedFields.length > 0) {
            this.log(`Repository: ${label.repository.url} - Label ${label.name} will be updated. Fields: ${modifiedFields.toString()}`);
            acc.push(label);
          }
        }
        return acc;
      }, []);

      // Loop in existing labels to identify if they need to be updated
      this.log(`Found ${labelsToUpdate.length} labels to update`);

      let cpt = 0;
      for (const label of labelsToUpdate) {
        cpt++;
        // Checking rate limit every 100 requests
        if (cpt === 100) {
          try {
            data = await gClient.query({
              query: GQL_RATELIMIT,
              fetchPolicy: 'no-cache',
              errorPolicy: 'ignore',
            });
          } catch (error) {
            console.log(JSON.stringify(GQL_RATELIMIT));
            console.log('THIS IS AN ERROR');
            this.log(error);
          }
          if (data.data.rateLimit !== undefined) {
            this.log(
              'GitHub Tokens - remaining: ' +
                data.data.rateLimit.remaining +
                ' query cost: ' +
                data.data.rateLimit.cost +
                ' (token will reset at: ' +
                data.data.rateLimit.resetAt +
                ')',
            );
            await checkRateLimit(data.data.rateLimit);
          } else {
            this.exit();
          }
          cpt = 0;
        }

        cli.action.start(`${cpt}/${labelsToUpdate.length} - Repository: ${label.repository.url} - Label: ${label.name}`);
        try {
          data = await gClient.query({
            query: GQL_UPDATELABEL,
            variables: { labelId: label.id, color: label.color, description: label.description },
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
          });
        } catch (error) {
          console.log(JSON.stringify(GQL_UPDATELABEL));
          console.log('THIS IS AN ERROR');
          this.log(error);
        }
        await sleep(250);

        if (
          data.data !== undefined &&
          data.data.errors !== undefined &&
          data.data.errors.length > 0
        ) {
          data.data.errors.forEach((error: { message: string }) => {
            this.log(error.message);
          });
        } else {
          // If there was no errors, the label is pushed back to Elasticsearch
          // This makes it possible to keep track of the labels that have been updated
          // And allow for resuming where the process was interrupted (if interrupted)
          await pushEsNodes(eClient, labelsIndex, [label], this.log, true);
        }
        cli.action.stop('done');
      }
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesByQuery(
      gClient,
      fetchNodes,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currentSource of sources) {
      this.log('Processing source: ' + currentSource.name);
      cli.action.start(
        'Grabbing labels for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedLabels = await fetchData.load({
        repoId: currentSource.id,
      });
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedLabels = ingestNodes(fetchedLabels, 'zindexer', currentSource.id);

      const labelsIndex = getEsIndex(
        userConfig.elasticsearch.dataIndices.githubLabels,
        userConfig.elasticsearch.oneIndexPerSource,
        currentSource.name,
      );

      await checkEsIndex(eClient, labelsIndex, esMapping, esSettings, this.log);
      await pushEsNodes(eClient, labelsIndex, fetchedLabels, this.log);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // Create an alias used for group querying
        await aliasEsIndex(
          eClient,
          userConfig.elasticsearch.dataIndices.githubLabels,
          this.log,
        );
      }
    }
  }
}
