import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/users/profile - Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            roadmaps: true,
            progress: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        updatedAt: new Date()
      }
    });

    res.json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const stats = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roadmaps: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        },
        progress: {
          select: {
            id: true,
            completed: true,
            createdAt: true
          }
        }
      }
    });

    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }

    const roadmapStats = {
      total: stats.roadmaps.length,
      active: stats.roadmaps.filter(r => r.status === 'active').length,
      completed: stats.roadmaps.filter(r => r.status === 'completed').length,
      draft: stats.roadmaps.filter(r => r.status === 'draft').length
    };

    const progressStats = {
      totalMilestones: stats.progress.length,
      completedMilestones: stats.progress.filter(p => p.completed).length,
      completionRate: stats.progress.length > 0 
        ? Math.round((stats.progress.filter(p => p.completed).length / stats.progress.length) * 100)
        : 0
    };

    res.json({
      roadmapStats,
      progressStats,
      joinedAt: stats.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;
