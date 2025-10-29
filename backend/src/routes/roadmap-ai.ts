import { Router, Request, Response } from 'express';
import { roadmapGeneratorService } from '../services/roadmap-generator.service';
import { z } from 'zod';

const router = Router();

// Validation schema
const generateRoadmapSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  goal: z.string().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  timeFrame: z.number().int().positive().optional(),
  preferences: z.array(z.string()).optional(),
});

/**
 * POST /api/roadmaps/ai/generate
 * Generate a roadmap using AI (Comprehend)
 * 
 * This endpoint:
 * 1. Analyzes user description with Amazon Comprehend
 * 2. Extracts skills, goals, timeframe, and preferences
 * 3. Generates a structured roadmap with phases and milestones
 * 4. Saves to database
 */
router.post('/ai/generate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const body = generateRoadmapSchema.parse(req.body);
    
    // Generate roadmap using AI
    const generatedRoadmap = await roadmapGeneratorService.generateRoadmap({
      description: body.description,
      goal: body.goal,
      skillLevel: body.skillLevel,
      timeFrame: body.timeFrame,
      preferences: body.preferences,
    });
    
    // Save to database
    const roadmap = await roadmapGeneratorService.createRoadmapInDatabase(
      userId,
      generatedRoadmap
    );
    
    return res.status(201).json({
      message: 'Roadmap generated successfully using AI',
      roadmap,
      aiAnalysis: {
        skillsDetected: generatedRoadmap.skills,
        timeFrame: generatedRoadmap.timeFrame,
        skillLevel: generatedRoadmap.skillLevel,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    console.error('AI roadmap generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate roadmap', 
      message: error.message,
      hint: 'Make sure Amazon Comprehend is configured correctly. See AWS_ACCOUNT_SETUP.md'
    });
  }
});

/**
 * POST /api/roadmaps/ai/analyze
 * Analyze text input and return insights (without creating roadmap)
 * 
 * Useful for preview or validation before generating full roadmap
 */
router.post('/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Analyze with Comprehend
    const analysis = await roadmapGeneratorService.analyzeUserInput(description);
    
    return res.json({
      analysis,
      suggestions: {
        recommendedSkills: analysis.skills,
        estimatedTimeFrame: `${analysis.timeFrame} weeks`,
        recommendedLevel: analysis.skillLevel,
        motivationLevel: analysis.sentiment,
      },
    });
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze input', 
      message: error.message 
    });
  }
});

/**
 * POST /api/roadmaps/:id/ai/enhance
 * Enhance existing roadmap with AI analysis
 * 
 * Analyzes roadmap progress and suggests improvements
 */
router.post('/:id/ai/enhance', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    // Get existing roadmap
    const roadmap = await (await import('../index')).prisma.roadmap.findFirst({
      where: { id, userId },
      include: {
        phases: {
          include: {
            milestones: true,
          },
        },
        progress: true,
      },
    });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    
    // Analyze roadmap description and progress
    const description = `${roadmap.description || ''} ${roadmap.goal}`;
    const analysis = await roadmapGeneratorService.analyzeUserInput(description);
    
    // Generate suggestions
    const suggestions = {
      skillGaps: analysis.skills.filter(skill => 
        !roadmap.skills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
      ),
      progressInsights: {
        completionRate: roadmap.progress.length > 0 
          ? roadmap.progress.filter(p => p.completed).length / roadmap.progress.length 
          : 0,
        recommendedNextSteps: roadmap.phases
          .filter(p => p.status === 'upcoming')
          .slice(0, 2)
          .map(p => p.title),
      },
      aiRecommendations: {
        skillsToAdd: analysis.skills.slice(0, 3),
        estimatedTimeline: `${analysis.timeFrame} weeks`,
        learningStyle: analysis.sentiment === 'POSITIVE' ? 'accelerated' : 'steady',
      },
    };
    
    return res.json({
      roadmapId: id,
      suggestions,
      aiAnalysis: analysis,
    });
  } catch (error: any) {
    console.error('Roadmap enhancement error:', error);
    return res.status(500).json({ 
      error: 'Failed to enhance roadmap', 
      message: error.message 
    });
  }
});

export default router;

