import {
  CreatePipelineCommand,
  DescribePipelineCommand,
  StartPipelineExecutionCommand,
  DescribePipelineExecutionCommand,
  ListPipelineExecutionsCommand,
  SageMakerClient,
} from '@aws-sdk/client-sagemaker';
import { sagemakerClient, AWS_AI_CONFIG } from '../config/aws-ai';

export interface PipelineConfig {
  pipelineName: string;
  pipelineDefinition: string; // JSON pipeline definition
  roleArn: string;
  tags?: Array<{ Key: string; Value: string }>;
}

export interface PipelineExecutionConfig {
  pipelineName: string;
  parameters?: Record<string, string>;
}

/**
 * Service for Amazon SageMaker Pipelines
 */
export class SageMakerService {
  /**
   * Create a SageMaker Pipeline
   */
  async createPipeline(config: PipelineConfig): Promise<string> {
    try {
      // Check if pipeline exists
      try {
        const describeCommand = new DescribePipelineCommand({
          PipelineName: config.pipelineName,
        });
        const existing = await sagemakerClient.send(describeCommand);
        console.log(`Pipeline ${config.pipelineName} already exists`);
        return existing.PipelineArn || '';
      } catch (error: any) {
        if (error.name !== 'ResourceNotFound') {
          throw error;
        }
      }

      // Create new pipeline
      const command = new CreatePipelineCommand({
        PipelineName: config.pipelineName,
        PipelineDefinition: config.pipelineDefinition,
        RoleArn: config.roleArn,
        Tags: config.tags,
      });

      const response = await sagemakerClient.send(command);
      console.log(`Created pipeline: ${response.PipelineArn}`);
      return response.PipelineArn || '';
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  }

  /**
   * Get pipeline details
   */
  async describePipeline(pipelineName: string) {
    const command = new DescribePipelineCommand({
      PipelineName: pipelineName,
    });
    return await sagemakerClient.send(command);
  }

  /**
   * Start pipeline execution
   */
  async startPipelineExecution(config: PipelineExecutionConfig): Promise<string> {
    const command = new StartPipelineExecutionCommand({
      PipelineName: config.pipelineName,
      PipelineParameters: config.parameters,
    });

    const response = await sagemakerClient.send(command);
    return response.PipelineExecutionArn || '';
  }

  /**
   * Get pipeline execution status
   */
  async getPipelineExecutionStatus(pipelineExecutionArn: string) {
    const command = new DescribePipelineExecutionCommand({
      PipelineExecutionArn: pipelineExecutionArn,
    });
    return await sagemakerClient.send(command);
  }

  /**
   * List pipeline executions
   */
  async listPipelineExecutions(pipelineName: string) {
    const command = new ListPipelineExecutionsCommand({
      PipelineName: pipelineName,
      MaxResults: 10,
    });
    return await sagemakerClient.send(command);
  }

  /**
   * Create a simple XGBoost training pipeline definition
   */
  createXGBoostPipelineDefinition(config: {
    pipelineName: string;
    trainingImage?: string;
    instanceType: string;
    roleArn: string;
    inputDataPath: string;
    outputModelPath: string;
  }): string {
    // This is a simplified pipeline definition
    // In production, you'd use SageMaker Pipelines SDK (Python) or construct JSON properly
    return JSON.stringify({
      Version: '2020-12-01',
      Metadata: {},
      Parameters: [
        {
          Name: 'TrainingInstanceType',
          Type: 'String',
          DefaultValue: config.instanceType || 'ml.m5.xlarge',
        },
        {
          Name: 'InputDataPath',
          Type: 'String',
          DefaultValue: config.inputDataPath,
        },
        {
          Name: 'OutputModelPath',
          Type: 'String',
          DefaultValue: config.outputModelPath,
        },
      ],
      PipelineExperimentConfig: {
        ExperimentName: `${config.pipelineName}-experiment`,
      },
      Steps: [
        {
          Name: 'TrainingStep',
          Type: 'Training',
          Arguments: {
            AlgorithmSpecification: {
              TrainingImage: config.trainingImage ?? '811284229777.dkr.ecr.us-east-1.amazonaws.com/xgboost:1.7-1',
              TrainingInputMode: 'File',
            },
            InputDataConfig: [
              {
                ChannelName: 'training',
                DataSource: {
                  S3DataSource: {
                    S3DataType: 'S3Prefix',
                    S3Uri: { 'Ref': 'InputDataPath' },
                  },
                },
              },
            ],
            OutputDataConfig: {
              S3OutputPath: { 'Ref': 'OutputModelPath' },
            },
            ResourceConfig: {
              InstanceType: { 'Ref': 'TrainingInstanceType' },
              InstanceCount: 1,
              VolumeSizeInGB: 30,
            },
            RoleArn: config.roleArn,
            StoppingCondition: {
              MaxRuntimeInSeconds: 86400,
            },
          },
        },
      ],
    });
  }
}

export const sagemakerService = new SageMakerService();

