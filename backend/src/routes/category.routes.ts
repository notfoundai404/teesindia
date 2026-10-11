import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// ─── Helper: normalise Prisma / unknown errors to a string ────────────────────
function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

// GET /api/categories
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: errMsg(err) });
  }
});

// GET /api/categories/:id — single category (admin)
router.get('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: String(req.params.id) },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category', error: errMsg(err) });
  }
});

// POST /api/categories (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, image, description, parentId } = req.body;
    if (!name || !slug) {
      res.status(400).json({ message: 'Name and slug are required' });
      return;
    }

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      res.status(409).json({ message: `A category with slug "${slug}" already exists` });
      return;
    }

    const category = await prisma.category.create({
      data: { name, slug, image: image || null, description: description || null, parentId: parentId || null },
    });
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: errMsg(err) });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, image, description, parentId } = req.body;
    const id = String(req.params.id);

    // Ensure category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check slug uniqueness (excluding self)
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.category.findUnique({ where: { slug } });
      if (slugTaken) {
        res.status(409).json({ message: `A category with slug "${slug}" already exists` });
        return;
      }
    }

    const data: Record<string, unknown> = {};
    if (name        !== undefined) data.name        = name;
    if (slug        !== undefined) data.slug        = slug;
    if (image       !== undefined) data.image       = image || null;
    if (description !== undefined) data.description = description || null;
    if (parentId    !== undefined) data.parentId    = parentId || null;

    const category = await prisma.category.update({ where: { id }, data });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update category', error: errMsg(err) });
  }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    // Ensure category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Block deletion if there are child sub-categories
    if (category._count.children > 0) {
      res.status(409).json({
        message: `Cannot delete "${category.name}" — it has ${category._count.children} sub-categor${category._count.children === 1 ? 'y' : 'ies'}. Delete or reassign sub-categories first.`,
      });
      return;
    }

    // Block deletion if products are linked
    if (category._count.products > 0) {
      res.status(409).json({
        message: `Cannot delete "${category.name}" — it still has ${category._count.products} product${category._count.products === 1 ? '' : 's'} assigned to it. Reassign or delete those products first.`,
      });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: errMsg(err) });
  }
});

export default router;
