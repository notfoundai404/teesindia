import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

// ─── On-demand ISR revalidation ──────────────────────────────────────────────
async function revalidateFrontend(scope: 'collections' | 'all' = 'collections'): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${frontendUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ scope }),
    });
  } catch (err) {
    console.warn('[Revalidation] Failed to ping frontend:', (err as Error).message);
  }
}

const router = Router();

// GET /api/collections — public list
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      include: {
        products: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { position: 'asc' } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch collections', error: err });
  }
});

// GET /api/collections/admin — admin list (includes inactive)
router.get('/admin', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const collections = await prisma.collection.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch collections', error: err });
  }
});

// GET /api/collections/:slug — single collection
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: { take: 2, orderBy: { position: 'asc' } },
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    });
    if (!collection) { res.status(404).json({ message: 'Collection not found' }); return; }
    res.json({ collection });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch collection', error: err });
  }
});

// POST /api/collections — create (admin)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, heroImage, isActive } = req.body;
    const collection = await prisma.collection.create({
      data: { name, slug, description, heroImage, isActive: isActive !== false },
    });
    res.status(201).json({ collection });
    revalidateFrontend('collections').catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Failed to create collection', error: err });
  }
});

// PUT /api/collections/:id — update (admin)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, heroImage, isActive } = req.body;
    const data: any = {};
    if (name       !== undefined) data.name       = name;
    if (slug       !== undefined) data.slug       = slug;
    if (description !== undefined) data.description = description;
    if (heroImage  !== undefined) data.heroImage  = heroImage;
    if (isActive   !== undefined) data.isActive   = isActive;

    const collection = await prisma.collection.update({ where: { id: req.params.id }, data });
    res.json({ collection });
    revalidateFrontend('collections').catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Failed to update collection', error: err });
  }
});

// DELETE /api/collections/:id — delete (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.json({ message: 'Collection deleted' });
    revalidateFrontend('collections').catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete collection', error: err });
  }
});

// POST /api/collections/:id/products — add product to collection
router.post('/:id/products', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    await prisma.collectionProduct.create({
      data: { collectionId: req.params.id, productId },
    });
    res.status(201).json({ message: 'Product added to collection' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err });
  }
});

// DELETE /api/collections/:id/products/:productId — remove product from collection
router.delete('/:id/products/:productId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.collectionProduct.delete({
      where: {
        collectionId_productId: {
          collectionId: req.params.id,
          productId:    req.params.productId,
        },
      },
    });
    res.json({ message: 'Product removed from collection' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove product', error: err });
  }
});

export default router;
