import { Router, Request, Response } from 'express';
import { comprehendService } from '../services/comprehend.service';
import { personalizeService } from '../services/personalize.service';
import { sagemakerService } from '../services/sagemaker.service';
import { AWS_AI_CONFIG } from '../config/aws-ai';
import { z } from 'zod';

const router = Router();

// Validation schemas
const analyzeTextSchema = z.object({
  text: z.string().min(1).max(5000),
  includeEntities: z.boolean().optional().default(true),
  includeKeyPhrases: z.boolean().optional().default(true),
  includeSentiment: z.boolean().optional().default(true),
});

const batchSentimentSchema = z.object({
  texts: z.array(z.string().min(1).max(5000)).min(1).max(25),
  languageCode: z.string().optional().default('en'),
});

const createDatasetGroupSchema = z.object({
  name: z.string().min(1).max(63),
});

const createPipelineSchema = z.object({
  pipelineName: z.string().min(1).max(63),
  instanceType: z.string().optional().default('ml.m5.xlarge'),
  inputDataPath: z.string().url(),
  outputModelPath: z.string().url(),
});

const startPipelineSchema = z.object({
  pipelineName: z.string().min(1),
  parameters: z.record(z.string()).optional(),
});

// ==================== COMPREHEND ROUTES ====================

/**
 * POST /api/ai/comprehend/analyze
 * Analyze text for language, sentiment, entities, and key phrases
 */
router.post('/comprehend/analyze', async (req: Request, res: Response) => {
  try {
    const body = analyzeTextSchema.parse(req.body);
    const result = await comprehendService.analyzeText(body.text);

    // Filter results based on include flags
    const response: any = {
      language: result.language,
    };

    if (body.includeSentiment) {
      response.sentiment = result.sentiment;
    }

    if (body.includeEntities) {
      response.entities = result.entities;
    }

    if (body.includeKeyPhrases) {
      response.keyPhrases = result.keyPhrases;
    }

    return res.json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Comprehend analyze error:', error);
    return res.status(500).json({ error: 'Failed to analyze text', message: error.message });
  }
});

/**
 * POST /api/ai/comprehend/sentiment
 * Detect sentiment only
 */
router.post('/comprehend/sentiment', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await comprehendService.detectSentiment(text);
    return res.json(result);
  } catch (error: any) {
    console.error('Sentiment detection error:', error);
    return res.status(500).json({ error: 'Failed to detect sentiment', message: error.message });
  }
});

/**
 * POST /api/ai/comprehend/batch-sentiment
 * Batch sentiment analysis (up to 25 texts)
 */
router.post('/comprehend/batch-sentiment', async (req: Request, res: Response) => {
  try {
    const body = batchSentimentSchema.parse(req.body);
    const result = await comprehendService.batchDetectSentiment(
      body.texts,
      body.languageCode || 'en'
    );
    return res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Batch sentiment error:', error);
    return res.status(500).json({ error: 'Failed to analyze sentiments', message: error.message });
  }
});

// ==================== PERSONALIZE ROUTES ====================

/**
 * POST /api/ai/personalize/dataset-group
 * Create a new dataset group
 * 
 * NOTE: Creating dataset groups works without S3, but importing data will require S3.
 */
router.post('/personalize/dataset-group', async (req: Request, res: Response) => {
  try {
    const body = createDatasetGroupSchema.parse(req.body);
    const datasetGroupArn = await personalizeService.createDatasetGroup(body.name);
    return res.json({ datasetGroupArn, message: 'Dataset group created successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Personalize dataset group error:', error);
    return res.status(500).json({ error: 'Failed to create dataset group', message: error.message });
  }
});

/**
 * GET /api/ai/personalize/dataset-group/:arn/status
 * Get dataset group status
 */
router.get('/personalize/dataset-group/:arn/status', async (req: Request, res: Response) => {
  try {
    const { arn } = req.params;
    if (!arn) {
      return res.status(400).json({ error: 'Dataset group ARN is required' });
    }
    const result = await personalizeService.getDatasetGroupStatus(arn);
    return res.json(result);
  } catch (error: any) {
    console.error('Get dataset group status error:', error);
    return res.status(500).json({ error: 'Failed to get status', message: error.message });
  }
});

/**
 * POST /api/ai/personalize/import
 * Import dataset to Personalize
 * 
 * NOTE: Requires S3 to be configured. If you haven't set up S3 yet, this endpoint will fail.
 * See AI_SERVICES_WITHOUT_S3.md for alternatives.
 */
router.post('/personalize/import', async (req: Request, res: Response) => {
  try {
    const { datasetArn, data, s3Key } = req.body;

    if (!datasetArn || !data || !s3Key) {
      return res.status(400).json({ error: 'datasetArn, data, and s3Key are required' });
    }

    if (!AWS_AI_CONFIG.s3Bucket) {
      return res.status(503).json({ 
        error: 'S3 not configured', 
        message: 'Personalize requires S3. Please configure S3_BUCKET_NAME in .env or see AI_SERVICES_WITHOUT_S3.md',
        suggestion: 'Use /api/ai/comprehend/* endpoints instead - they work without S3'
      });
    }

    const importJobArn = await personalizeService.importDataset(
      datasetArn,
      data,
      s3Key
    );

    return res.json({ importJobArn, message: 'Dataset import job started' });
  } catch (error: any) {
    console.error('Import dataset error:', error);
    return res.status(500).json({ 
      error: 'Failed to import dataset', 
      message: error.message,
      hint: 'Check if S3 is properly configured. See AI_SERVICES_WITHOUT_S3.md for help'
    });
  }
});

// ==================== SAGEMAKER ROUTES ====================

/**
 * POST /api/ai/sagemaker/pipeline
 * Create a new SageMaker pipeline
 * 
 * NOTE: Requires S3 to be configured for training data storage.
 * See AI_SERVICES_WITHOUT_S3.md if you haven't set up S3 yet.
 */
router.post('/sagemaker/pipeline', async (req: Request, res: Response) => {
  try {
    const body = createPipelineSchema.parse(req.body);

    if (!AWS_AI_CONFIG.sagemakerRoleArn) {
      return res.status(400).json({
        error: 'SAGEMAKER_ROLE_ARN not configured in environment variables',
        hint: 'See AWS_ACCOUNT_SETUP.md for IAM role setup',
      });
    }

    if (!AWS_AI_CONFIG.s3Bucket) {
      return res.status(503).json({ 
        error: 'S3 not configured', 
        message: 'SageMaker requires S3 for training data and model storage. Please configure S3_BUCKET_NAME in .env',
        suggestion: 'See AI_SERVICES_WITHOUT_S3.md for help or use /api/ai/comprehend/* endpoints instead'
      });
    }

    const pipelineDefinition = sagemakerService.createXGBoostPipelineDefinition({
      pipelineName: body.pipelineName,
      roleArn: AWS_AI_CONFIG.sagemakerRoleArn,
      instanceType: body.instanceType || 'ml.m5.xlarge',
      inputDataPath: body.inputDataPath,
      outputModelPath: body.outputModelPath,
      trainingImage: process.env.SAGEMAKER_TRAINING_IMAGE || '811284229777.dkr.ecr.us-east-1.amazonaws.com/xgboost:1.7-1',
    });

    const pipelineArn = await sagemakerService.createPipeline({
      pipelineName: body.pipelineName,
      pipelineDefinition,
      roleArn: AWS_AI_CONFIG.sagemakerRoleArn,
    });

    return res.json({ pipelineArn, message: 'Pipeline created successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create pipeline error:', error);
    return res.status(500).json({ error: 'Failed to create pipeline', message: error.message });
  }
});

/**
 * POST /api/ai/sagemaker/pipeline/start
 * Start a pipeline execution
 */
router.post('/sagemaker/pipeline/start', async (req: Request, res: Response) => {
  try {
    const body = startPipelineSchema.parse(req.body);
    const executionArn = await sagemakerService.startPipelineExecution({
      pipelineName: body.pipelineName,
      parameters: body.parameters,
    });

    return res.json({ executionArn, message: 'Pipeline execution started' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Start pipeline error:', error);
    return res.status(500).json({ error: 'Failed to start pipeline', message: error.message });
  }
});

/**
 * GET /api/ai/sagemaker/pipeline/:name
 * Get pipeline details
 */
router.get('/sagemaker/pipeline/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ error: 'Pipeline name is required' });
    }
    const result = await sagemakerService.describePipeline(name);
    return res.json(result);
  } catch (error: any) {
    console.error('Get pipeline error:', error);
    return res.status(500).json({ error: 'Failed to get pipeline', message: error.message });
  }
});

/**
 * GET /api/ai/sagemaker/pipeline/:name/executions
 * List pipeline executions
 */
router.get('/sagemaker/pipeline/:name/executions', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ error: 'Pipeline name is required' });
    }
    const result = await sagemakerService.listPipelineExecutions(name);
    return res.json(result);
  } catch (error: any) {
    console.error('List executions error:', error);
    return res.status(500).json({ error: 'Failed to list executions', message: error.message });
  }
});

/**
 * GET /api/ai/sagemaker/execution/:arn
 * Get pipeline execution status
 */
router.get('/sagemaker/execution/:arn', async (req: Request, res: Response) => {
  try {
    const { arn } = req.params;
    if (!arn) {
      return res.status(400).json({ error: 'Execution ARN is required' });
    }
    const result = await sagemakerService.getPipelineExecutionStatus(arn);
    return res.json(result);
  } catch (error: any) {
    console.error('Get execution status error:', error);
    return res.status(500).json({ error: 'Failed to get execution status', message: error.message });
  }
});

export default router;

