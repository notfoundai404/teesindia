import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { sendOrderConfirmation } from '../emails/orderConfirmation';

const router = Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/checkout
// One-shot atomic checkout:
//   1. Auto-register or log-in user by email (sets JWT cookies)
//   2. Save shipping address
//   3. Create DB order
//   4. Create Razorpay order
//   Returns: { razorpayOrderId, amount, currency, keyId, orderId }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, email, phone,
      address,        // { line1, line2?, city, state, pincode }
      items,          // [{ productId, variantId?, quantity, size? }]
      paymentMethod,  // 'RAZORPAY' | 'COD'
    } = req.body;

    if (!name || !email || !phone || !address || !items?.length) {
      res.status(400).json({ message: 'name, email, phone, address, and items are required' });
      return;
    }

    // ── 1. Get or create user ────────────────────────────────────────
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-register: use phone last 6 digits as temporary password
      const tempPassword = phone.slice(-6) + 'tees';
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      user = await prisma.user.create({
        data: { name, email, phone, passwordHash },
      });
    }

    // Issue JWT cookies so subsequent authenticated calls work
    const accessToken  = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET!,         { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    res.cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // ── 2. Save address ──────────────────────────────────────────────
    const savedAddress = await prisma.address.create({
      data: {
        userId:    user.id,
        name,
        phone,
        line1:     address.line1,
        line2:     address.line2 || null,
        city:      address.city,
        state:     address.state,
        pincode:   address.pincode,
        isDefault: false,
      },
    });

    // ── 3. Calculate total & create DB order ─────────────────────────
    let totalAmount = 0;
    const orderItems = [];

    // We need a real DB product for the OrderItem relation.
    // For custom-tee items we use a sentinel product lookup by slug 'custom-tee'
    // or fall back to client-provided price without a DB product reference.
    for (const item of items) {
      // Custom tee — no real product row; use client-provided price
      if (!item.productId || item.productId === 'custom-tee') {
        const price = Number(item.price) || 999; // default ₹999 if not sent
        totalAmount += price * item.quantity;
        // We need a real productId for the FK — try to find a sentinel product
        const sentinel = await prisma.product.findFirst({ where: { slug: 'custom-tee' } });
        if (!sentinel) {
          // Skip adding as OrderItem (no FK) — just count in total
          continue;
        }
        orderItems.push({
          productId: sentinel.id,
          variantId: null,
          quantity:  item.quantity,
          price,
          size:      item.size || null,
        });
        continue;
      }

      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        res.status(400).json({
          message: `Product "${product?.name || 'Item'}" is no longer available. Please remove it from your cart to proceed.`,
        });
        return;
      }
      const price = Number(product.price);
      totalAmount += price * item.quantity;
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity:  item.quantity,
        price,
        size:      item.size || null,
      });
    }

    const shipping = totalAmount >= 999 ? 0 : 99;
    const grandTotal = totalAmount + shipping;

    const order = await prisma.order.create({
      data: {
        userId:        user.id,
        addressId:     savedAddress.id,
        totalAmount:   grandTotal,
        paymentMethod: paymentMethod || 'RAZORPAY',
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // ── 4. COD — skip Razorpay ────────────────────────────────────────
    if (paymentMethod === 'COD') {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CONFIRMED' } });

      // Send confirmation email (non-blocking — order already confirmed)
      prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { product: true } },
          address: true,
          user: { select: { name: true, email: true } },
        },
      }).then(fullOrder => {
        if (fullOrder && fullOrder.user)
          sendOrderConfirmation(fullOrder as any);
      }).catch(() => {});

      res.json({ orderId: order.id, paymentMethod: 'COD' });
      return;
    }

    // ── 5. Create Razorpay order ─────────────────────────────────────
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(grandTotal * 100),   // paise
      currency: 'INR',
      receipt:  order.id,
      notes:    { name, email, phone },
    });

    await prisma.order.update({
      where: { id: order.id },
      data:  { razorpayOrderId: rzpOrder.id },
    });

    res.json({
      orderId:         order.id,
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
      prefill:         { name, email, contact: phone },
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Checkout failed', error: err });
  }
});

// POST /api/payment/create-order
router.post('/create-order', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, orderId } = req.body; // amount in paise

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: orderId,
    });

    // Update order with razorpay order id
    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment order', error: err });
  }
});

// POST /api/payment/verify
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ message: 'Payment verification failed — signature mismatch' });
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus:    'PAID',
        status:           'CONFIRMED',
        razorpayPayId:    razorpay_payment_id,
      },
    });

    // Send confirmation email (non-blocking)
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        address: true,
        user: { select: { name: true, email: true } },
      },
    }).then(fullOrder => {
      if (fullOrder && fullOrder.user)
        sendOrderConfirmation(fullOrder as any);
    }).catch(() => {});

    res.json({ message: 'Payment verified', paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed', error: err });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/webhook
// Razorpay webhook — handles payment.captured events asynchronously.
// This is the reliability fallback: if the customer closes the browser
// before the frontend /verify call runs, the webhook still marks the
// order as PAID. Verifies the X-Razorpay-Signature HMAC header.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody   = (req as Request & { rawBody?: string }).rawBody;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (typeof signature !== 'string' || !/^[\da-f]{64}$/i.test(signature) || !rawBody || !webhookSecret) {
      res.status(400).json({ message: 'Webhook signature, raw body, or secret missing or invalid' });
      return;
    }

    // Verify signature: HMAC-SHA256(secret, rawBody) === signature
    const expectedSignature = Buffer.from(crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex'), 'hex');
    const receivedSignature = Buffer.from(signature, 'hex');

    if (!crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
      res.status(400).json({ message: 'Invalid webhook signature' });
      return;
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;

    if (event !== 'payment.captured' || !paymentEntity) {
      // Acknowledge other events but take no action
      res.json({ received: true });
      return;
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPayId   = paymentEntity.id;

    if (!razorpayOrderId) {
      res.json({ received: true });
      return;
    }

    // Find the order by its Razorpay order ID and mark as PAID (idempotent)
    const order = await prisma.order.findFirst({ where: { razorpayOrderId } });
    if (order && order.paymentStatus !== 'PAID') {
      const updated = await prisma.order.updateMany({
        where: { id: order.id, paymentStatus: { not: 'PAID' } },
        data: {
          paymentStatus: 'PAID',
          status:        'CONFIRMED',
          razorpayPayId,
        },
      });

      if (updated.count > 0) {
        // Send confirmation email (non-blocking)
        void prisma.order.findUnique({
          where: { id: order.id },
          include: {
            items:   { include: { product: true } },
            address: true,
            user:    { select: { name: true, email: true } },
          },
        }).then(fullOrder => {
          if (fullOrder && fullOrder.user)
            return sendOrderConfirmation(fullOrder as any);
          return undefined;
        }).catch(err => {
          console.error('Webhook order confirmation email failed:', err);
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;
