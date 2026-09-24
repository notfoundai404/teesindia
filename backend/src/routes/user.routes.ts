import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// GET /api/user/profile
router.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, addresses: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err });
  }
});

// PUT /api/user/password
router.put('/password', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash } });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password', error: err });
  }
});

// POST /api/user/addresses
router.post('/addresses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { userId: req.user!.id, name, phone, line1, line2, city, state, pincode, isDefault: isDefault || false },
    });
    res.status(201).json({ address });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add address', error: err });
  }
});

// PUT /api/user/addresses/:id
router.put('/addresses/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({
      where: { id: String(req.params.id) },
      data: { name, phone, line1, line2, city, state, pincode, isDefault },
    });
    res.json({ address });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update address', error: err });
  }
});

// DELETE /api/user/addresses/:id
router.delete('/addresses/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.address.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete address', error: err });
  }
});

export default router;
