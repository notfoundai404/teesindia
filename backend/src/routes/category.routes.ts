import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err });
  }
});

// POST /api/categories (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, image, description, parentId } = req.body;
    const category = await prisma.category.create({ data: { name, slug, image, description, parentId } });
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, image, description, parentId } = req.body;
    const category = await prisma.category.update({ where: { id: req.params.id }, data: { name, slug, image, description, parentId } });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update category', error: err });
  }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err });
  }
});

export default router;
