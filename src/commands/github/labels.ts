import { flags } from '@oclif/command';
import cli from 'cli-ux';
import loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import Command from '../../base';
import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
import ghClient from '../../utils/github/utils/ghClient';

import checkConfig from '../../utils/github/labels/checkConfig';
import { LabelsConfig } from '../../utils/github/labels/labelsConfig.type';
import fetchAllLabels from '../../utils/github/labels/fetchAllLabels';
import mutateGithubNodes from '../../utils/github/mutateGithubNodes';

import GQL_UPDATELABEL from '../../utils/github/labels/updateLabel.graphql';

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

      // Function to display logs while data is being submitted by mutateGithubNodes
      const getProgressData = (node: any) => {
        return ` - Repository: ${node.repository.url} - Label: ${node.name} ...updated`
      }

      const getMutationVariables = (node: any) => {
        return { labelId: node.id, color: node.color, description: node.description }
      }

      // Function executed after the mutation of each node
      // If there was no errors, the label is pushed back to Elasticsearch
      // This makes it possible to keep track of the labels that have been updated
      // And allow for resuming where the process was interrupted (if interrupted)         
      const postMutation = async (node: any) => {
        await pushEsNodes(eClient, labelsIndex, [node], this.log, true)
      }

      await mutateGithubNodes(gClient, labelsToUpdate, GQL_UPDATELABEL, getMutationVariables, getProgressData, postMutation, {});

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
