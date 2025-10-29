import {
  CreateDatasetGroupCommand,
  CreateDatasetCommand,
  CreateDatasetImportJobCommand,
  CreateSolutionCommand,
  CreateSolutionVersionCommand,
  CreateCampaignCommand,
  DescribeDatasetGroupCommand,
  DescribeDatasetCommand,
  DescribeSolutionCommand,
  DescribeCampaignCommand,
  ListDatasetGroupsCommand,
  PersonalizeClient,
} from '@aws-sdk/client-personalize';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/aws';
import { personalizeClient, AWS_AI_CONFIG } from '../config/aws-ai';

export interface DatasetSchema {
  type: 'Interactions' | 'Users' | 'Items';
  name: string;
  schema: string; // JSON schema string
}

export interface PersonalizeConfig {
  datasetGroupName: string;
  solutionName: string;
  campaignName: string;
  roleArn: string;
}

/**
 * Service for Amazon Personalize operations
 */
export class PersonalizeService {
  /**
   * Create or get existing dataset group
   */
  async createDatasetGroup(name: string): Promise<string> {
    try {
      // Check if dataset group already exists
      const listCommand = new ListDatasetGroupsCommand({});
      const listResponse = await personalizeClient.send(listCommand);
      const existing = listResponse.datasetGroups?.find(
        (dsg) => dsg.name === name
      );

      if (existing) {
        console.log(`Dataset group ${name} already exists: ${existing.datasetGroupArn}`);
        return existing.datasetGroupArn!;
      }

      // Create new dataset group
      const command = new CreateDatasetGroupCommand({
        name,
      });

      const response = await personalizeClient.send(command);
      console.log(`Created dataset group: ${response.datasetGroupArn}`);
      return response.datasetGroupArn!;
    } catch (error: any) {
      if (error.name === 'ResourceAlreadyExistsException') {
        // Try to find it
        const listCommand = new ListDatasetGroupsCommand({});
        const listResponse = await personalizeClient.send(listCommand);
        const existing = listResponse.datasetGroups?.find(
          (dsg) => dsg.name === name
        );
        return existing?.datasetGroupArn || '';
      }
      throw error;
    }
  }

  /**
   * Create a dataset within a dataset group
   */
  async createDataset(
    datasetGroupArn: string,
    name: string,
    schemaArn: string,
    datasetType: 'Interactions' | 'Users' | 'Items'
  ): Promise<string> {
    const command = new CreateDatasetCommand({
      name,
      datasetGroupArn,
      datasetType,
      schemaArn,
    });

    const response = await personalizeClient.send(command);
    return response.datasetArn!;
  }

  /**
   * Upload dataset to S3 and create import job
   */
  async importDataset(
    datasetArn: string,
    data: string | Buffer,
    s3Key: string
  ): Promise<string> {
    if (!AWS_AI_CONFIG.s3Bucket) {
      throw new Error('S3 bucket not configured. Please set S3_BUCKET_NAME or AI_ARTIFACTS_BUCKET in .env');
    }

    // Upload to S3
    try {
      const putCommand = new PutObjectCommand({
        Bucket: AWS_AI_CONFIG.s3Bucket,
        Key: s3Key,
        Body: data,
      });
      await s3Client.send(putCommand);
    } catch (error: any) {
      throw new Error(`S3 upload failed: ${error.message}. Please ensure S3 is configured correctly.`);
    }

    const s3Location = `s3://${AWS_AI_CONFIG.s3Bucket}/${s3Key}`;

    // Create import job
    const command = new CreateDatasetImportJobCommand({
      jobName: `import-${Date.now()}`,
      datasetArn,
      dataSource: {
        dataLocation: s3Location,
      },
      roleArn: AWS_AI_CONFIG.personalizeRoleArn,
    });

    const response = await personalizeClient.send(command);
    return response.datasetImportJobArn!;
  }

  /**
   * Create a solution (recommendation recipe)
   */
  async createSolution(
    datasetGroupArn: string,
    name: string,
    recipeArn?: string
  ): Promise<string> {
    const command = new CreateSolutionCommand({
      name,
      datasetGroupArn,
      recipeArn: recipeArn || 'arn:aws:personalize:::recipe/aws-user-personalization', // Default recipe
    });

    const response = await personalizeClient.send(command);
    return response.solutionArn!;
  }

  /**
   * Create solution version (train the model)
   */
  async createSolutionVersion(solutionArn: string): Promise<string> {
    const command = new CreateSolutionVersionCommand({
      solutionArn,
    });

    const response = await personalizeClient.send(command);
    return response.solutionVersionArn!;
  }

  /**
   * Create a campaign (deploy solution version)
   */
  async createCampaign(
    solutionVersionArn: string,
    name: string,
    minProvisionedTPS: number = 1
  ): Promise<string> {
    const command = new CreateCampaignCommand({
      name,
      solutionVersionArn,
      minProvisionedTPS,
    });

    const response = await personalizeClient.send(command);
    return response.campaignArn!;
  }

  /**
   * Get dataset group status
   */
  async getDatasetGroupStatus(datasetGroupArn: string) {
    const command = new DescribeDatasetGroupCommand({
      datasetGroupArn,
    });
    return await personalizeClient.send(command);
  }

  /**
   * Get campaign status
   */
  async getCampaignStatus(campaignArn: string) {
    const command = new DescribeCampaignCommand({
      campaignArn,
    });
    return await personalizeClient.send(command);
  }

  /**
   * Get solution status
   */
  async getSolutionStatus(solutionArn: string) {
    const command = new DescribeSolutionCommand({
      solutionArn,
    });
    return await personalizeClient.send(command);
  }

  /**
   * Complete workflow: Create dataset group, import data, train, and deploy
   */
  async setupCompleteWorkflow(config: PersonalizeConfig, interactionData: string) {
    // 1. Create dataset group
    const datasetGroupArn = await this.createDatasetGroup(config.datasetGroupName);

    // 2. Define interaction schema (USER_ID, ITEM_ID, TIMESTAMP, EVENT_TYPE)
    const interactionSchema = {
      type: 'record',
      name: 'Interactions',
      namespace: 'com.amazonaws.personalize.schema',
      fields: [
        {
          name: 'USER_ID',
          type: 'string',
        },
        {
          name: 'ITEM_ID',
          type: 'string',
        },
        {
          name: 'TIMESTAMP',
          type: 'long',
        },
        {
          name: 'EVENT_TYPE',
          type: 'string',
        },
      ],
      version: '1.0',
    };

    // Note: In production, you'd need to create the schema via Personalize API
    // For now, this is a simplified version

    // 3. Upload and import data
    const s3Key = `personalize/${config.datasetGroupName}/interactions/${Date.now()}.csv`;
    const importJobArn = await this.importDataset(
      datasetGroupArn, // This would be dataset ARN in real implementation
      interactionData,
      s3Key
    );

    return {
      datasetGroupArn,
      importJobArn,
      s3Key,
      nextSteps: [
        'Wait for import job to complete',
        'Create solution version',
        'Create campaign',
      ],
    };
  }
}

export const personalizeService = new PersonalizeService();

