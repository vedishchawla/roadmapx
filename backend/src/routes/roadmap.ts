import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createRoadmapSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  skills: z.array(z.string()),
  goal: z.string().min(1),
  timeFrame: z.number().int().positive(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preference: z.enum(['visual', 'hands-on', 'theoretical']),
  phases: z.array(z.object({
    title: z.string(),
    order: z.number().int(),
    duration: z.string(),
    milestones: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      order: z.number().int(),
      resources: z.array(z.object({
        name: z.string(),
        url: z.string().url(),
        type: z.enum(['link', 'video', 'document']).default('link')
      })).optional()
    }))
  })).optional()
});

const updateRoadmapSchema = createRoadmapSchema.partial();

// GET /api/roadmaps - Get all roadmaps for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      include: {
        phases: {
          include: {
            milestones: {
              include: {
                resources: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            phases: true,
            progress: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

// GET /api/roadmaps/:id - Get specific roadmap
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId },
      include: {
        phases: {
          include: {
            milestones: {
              include: {
                resources: true
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        progress: true
      }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

// POST /api/roadmaps - Create new roadmap
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data = createRoadmapSchema.parse(req.body);

    const roadmap = await prisma.roadmap.create({
      data: {
        ...data,
        userId,
        phases: {
          create: data.phases?.map(phase => ({
            title: phase.title,
            order: phase.order,
            duration: phase.duration,
            milestones: {
              create: phase.milestones.map(milestone => ({
                title: milestone.title,
                description: milestone.description,
                order: milestone.order,
                resources: {
                  create: milestone.resources || []
                }
              }))
            }
          })) || []
        }
      },
      include: {
        phases: {
          include: {
            milestones: {
              include: {
                resources: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(roadmap);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create roadmap' });
  }
});

// PUT /api/roadmaps/:id - Update roadmap
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const data = updateRoadmapSchema.parse(req.body);

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    const updatedRoadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        phases: {
          include: {
            milestones: {
              include: {
                resources: true
              }
            }
          }
        }
      }
    });

    res.json(updatedRoadmap);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update roadmap' });
  }
});

// DELETE /api/roadmaps/:id - Delete roadmap
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    await prisma.roadmap.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete roadmap' });
  }
});

// PATCH /api/roadmaps/:id/status - Update roadmap status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    if (!['draft', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    const updatedRoadmap = await prisma.roadmap.update({
      where: { id },
      data: { status }
    });

    res.json(updatedRoadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update roadmap status' });
  }
});

export default router;
