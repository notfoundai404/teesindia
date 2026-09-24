import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/orders — create order
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { addressId, paymentMethod, items, notes } = req.body;

    // Calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        res.status(400).json({ message: `Product "${product?.name || item.productId}" is no longer available` });
        return;
      }
      const price = Number(product.price);
      totalAmount += price * item.quantity;
      orderItems.push({ productId: item.productId, variantId: item.variantId || null, quantity: item.quantity, price, size: item.size });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        addressId,
        totalAmount,
        paymentMethod,
        notes,
        items: { create: orderItems },
      },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } }, address: true },
    });

    // Clear cart after order
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err });
  }
});

// GET /api/orders — user's orders
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } }, address: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err });
  }
});

// GET /api/orders/:id/public — no auth, used by order-success page
router.get('/:id/public', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { position: 'asc' } } },
            },
            variant: true,
          },
        },
        address: true,
        user: { select: { name: true, email: true } },
      },
    });
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const where: any = { id: String(req.params.id) };
    if (!isAdmin) {
      where.userId = req.user!.id;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1, orderBy: { position: 'asc' } } } },
            variant: true,
          },
        },
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err });
  }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status, paymentStatus },
    });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err });
  }
});

// GET /api/orders/admin/all (admin - list all orders)
router.get('/admin/all', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: { user: { select: { name: true, email: true } }, address: true, items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err });
  }
});

export default router;
