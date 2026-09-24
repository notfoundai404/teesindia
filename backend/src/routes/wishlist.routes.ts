import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// GET /api/wishlist
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: { include: { images: { orderBy: { position: 'asc' }, take: 2 }, category: true } } },
        },
      },
    });
    res.json({ items: wishlist?.items || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: err });
  }
});

// POST /api/wishlist/add
router.post('/add', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId: req.user!.id } });

    const item = await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      update: {},
      create: { wishlistId: wishlist.id, productId },
    });
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to wishlist', error: err });
  }
});

// DELETE /api/wishlist/remove
router.delete('/remove', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (wishlist) {
      await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
    }
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove from wishlist', error: err });
  }
});

export default router;
