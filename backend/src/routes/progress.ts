import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateProgressSchema = z.object({
  completed: z.boolean(),
  notes: z.string().optional()
});

// GET /api/progress/:roadmapId - Get progress for a roadmap
router.get('/:roadmapId', async (req: Request, res: Response) => {
  try {
    const { roadmapId } = req.params;
    const userId = (req as any).user.id;

    const progress = await prisma.progress.findMany({
      where: {
        userId,
        roadmapId
      },
      include: {
        roadmap: {
          select: {
            title: true,
            status: true
          }
        }
      }
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// POST /api/progress/:roadmapId - Create progress entry
router.post('/:roadmapId', async (req: Request, res: Response) => {
  try {
    const { roadmapId } = req.params;
    const userId = (req as any).user.id;
    const data = updateProgressSchema.parse(req.body);

    // Verify roadmap exists and belongs to user
    const roadmap = await prisma.roadmap.findFirst({
      where: { id: roadmapId, userId }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    const progress = await prisma.progress.create({
      data: {
        ...data,
        userId,
        roadmapId
      }
    });

    res.status(201).json(progress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create progress entry' });
  }
});

// PUT /api/progress/:id - Update progress entry
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const data = updateProgressSchema.parse(req.body);

    const progress = await prisma.progress.findFirst({
      where: { id, userId }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }

    const updatedProgress = await prisma.progress.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    res.json(updatedProgress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update progress entry' });
  }
});

// DELETE /api/progress/:id - Delete progress entry
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const progress = await prisma.progress.findFirst({
      where: { id, userId }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }

    await prisma.progress.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete progress entry' });
  }
});

// GET /api/progress/stats/:roadmapId - Get progress statistics for a roadmap
router.get('/stats/:roadmapId', async (req: Request, res: Response) => {
  try {
    const { roadmapId } = req.params;
    const userId = (req as any).user.id;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id: roadmapId, userId },
      include: {
        phases: {
          include: {
            milestones: true
          }
        },
        progress: true
      }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    const totalMilestones = roadmap.phases.reduce(
      (total, phase) => total + phase.milestones.length, 0
    );

    const completedMilestones = roadmap.progress.filter(p => p.completed).length;
    const completionRate = totalMilestones > 0 
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    const phaseStats = roadmap.phases.map(phase => {
      const phaseProgress = roadmap.progress.filter(p => 
        phase.milestones.some(m => m.id === p.id)
      );
      
      return {
        phaseId: phase.id,
        title: phase.title,
        totalMilestones: phase.milestones.length,
        completedMilestones: phaseProgress.filter(p => p.completed).length,
        completionRate: phase.milestones.length > 0 
          ? Math.round((phaseProgress.filter(p => p.completed).length / phase.milestones.length) * 100)
          : 0
      };
    });

    res.json({
      totalMilestones,
      completedMilestones,
      completionRate,
      phaseStats,
      lastUpdated: roadmap.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress statistics' });
  }
});

export default router;
