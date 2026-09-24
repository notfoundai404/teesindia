import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// All cart routes require auth
router.use(authenticate);

// GET /api/cart
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Purge any cart items whose product is inactive or deleted
    await prisma.cartItem.deleteMany({
      where: {
        userId: req.user!.id,
        product: { isActive: false },
      },
    }).catch(() => {});

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: req.user!.id,
        product: { isActive: true },
      },
      include: {
        product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } },
        variant: true,
      },
    });
    res.json({ cartItems });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart', error: err });
  }
});

// POST /api/cart/add
router.post('/add', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      res.status(400).json({ message: 'This product is no longer available' });
      return;
    }

    if (product.stock <= 0) {
      res.status(400).json({ message: 'This product is out of stock' });
      return;
    }

    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant && variant.stock <= 0) {
        res.status(400).json({ message: 'Selected size is out of stock' });
        return;
      }
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.user!.id, productId, variantId: variantId || null },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: { include: { images: { take: 1 } } }, variant: true },
      });
      res.json({ cartItem: updated });
    } else {
      const created = await prisma.cartItem.create({
        data: { userId: req.user!.id, productId, variantId: variantId || null, quantity },
        include: { product: { include: { images: { take: 1 } } }, variant: true },
      });
      res.status(201).json({ cartItem: created });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to cart', error: err });
  }
});

// PUT /api/cart/update
router.put('/update', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cartItemId, quantity } = req.body;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      res.json({ message: 'Item removed' });
      return;
    }
    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: { include: { images: { take: 1 } } }, variant: true },
    });
    res.json({ cartItem: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart', error: err });
  }
});

// DELETE /api/cart/remove
router.delete('/remove', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cartItemId } = req.body;
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item', error: err });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart', error: err });
  }
});

export default router;
