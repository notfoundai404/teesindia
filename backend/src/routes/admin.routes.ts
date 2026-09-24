import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/stats — dashboard overview
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalOrders, totalProducts, totalCustomers, totalRevenue, recentOrders, lowStockProducts] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        select: { id: true, name: true, stock: true, images: { take: 1 } },
        take: 5,
      }),
    ]);

    res.json({
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err });
  }
});

// GET /api/admin/customers
router.get('/customers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const where: any = { role: 'CUSTOMER' };
    if (search) where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
    ];

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ customers, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customers', error: err });
  }
});

// GET /api/admin/customers/:id — customer profile + order history
router.get('/customers/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: { select: { id: true, name: true, images: { take: 1 } } },
              },
            },
            address: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) { res.status(404).json({ message: 'Customer not found' }); return; }
    res.json({ customer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customer details', error: err });
  }
});

// GET /api/admin/revenue — daily revenue for last 30 days (for dashboard chart)
router.get('/revenue', async (_req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const byDate: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      byDate[d.toISOString().slice(0, 10)] = 0;
    }

    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      if (byDate[key] !== undefined) {
        byDate[key] += Number(order.totalAmount);
      }
    }

    const data = Object.entries(byDate).map(([date, revenue]) => ({
      date,
      revenue,
      label: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revenue', error: err });
  }
});

export default router;

