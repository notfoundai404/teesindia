import { sendMail } from '../lib/mailer';

interface OrderItem {
  product: { name: string };
  quantity: number;
  price: any;
  size?: string | null;
}

export interface OrderForEmail {
  id: string;
  createdAt: Date;
  totalAmount: any;
  paymentMethod: string;
  items: OrderItem[];
  address: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  user: { email: string; name: string };
}

export function renderOrderConfirmationEmail(order: OrderForEmail): string {
  const ACCENT  = '#C9A96E';
  const BG      = '#0a0a0a';
  const CARD_BG = '#111111';
  const TEXT    = '#ffffff';
  const MUTED   = '#888888';

  const shortId = order.id.toUpperCase().slice(0, 8);
  const date    = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const total   = Number(order.totalAmount).toLocaleString('en-IN');

  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #222;font-size:14px;color:${TEXT};">
        ${item.product.name}${item.size ? ` <span style="color:${MUTED};font-size:12px;">(${item.size})</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #222;font-size:14px;color:${MUTED};text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #222;font-size:14px;color:${TEXT};text-align:right;">
        ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const address = [
    order.address.line1,
    order.address.line2,
    `${order.address.city}, ${order.address.state} — ${order.address.pincode}`,
  ].filter(Boolean).join(', ');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — TEESINDIA™</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Arial',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${CARD_BG};border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:1px solid #222;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:${ACCENT};">PREMIUM CUSTOM APPAREL</p>
            <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:-0.03em;color:${TEXT};">TEESINDIA™</h1>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:${CARD_BG};padding:40px 40px 32px;text-align:center;border-bottom:1px solid #222;">
            <div style="width:72px;height:72px;border-radius:50%;background:rgba(201,169,110,0.15);border:2px solid ${ACCENT};display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
              <span style="font-size:32px;">✓</span>
            </div>
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${TEXT};">Order Confirmed!</h2>
            <p style="margin:0;font-size:15px;color:${MUTED};">Hi ${order.user.name}, your order has been placed successfully.</p>
          </td>
        </tr>

        <!-- Order Meta -->
        <tr>
          <td style="background:${CARD_BG};padding:24px 40px;border-bottom:1px solid #222;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Order ID</td>
                <td style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;text-align:right;">Date</td>
              </tr>
              <tr>
                <td style="font-size:16px;font-weight:700;color:${TEXT};">#${shortId}</td>
                <td style="font-size:14px;color:${TEXT};text-align:right;">${date}</td>
              </tr>
              <tr>
                <td style="padding-top:16px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;">Payment</td>
                <td style="padding-top:16px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;text-align:right;">Deliver To</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:${TEXT};">${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online (Razorpay)'}</td>
                <td style="font-size:13px;color:${TEXT};text-align:right;max-width:200px;">${address}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="background:${CARD_BG};padding:24px 40px;border-bottom:1px solid #222;">
            <p style="margin:0 0 16px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Order Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;padding-bottom:8px;">Item</th>
                  <th style="text-align:center;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;padding-bottom:8px;">Qty</th>
                  <th style="text-align:right;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;padding-bottom:8px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
            <!-- Grand Total -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="font-size:16px;font-weight:700;color:${TEXT};">Grand Total</td>
                <td style="font-size:18px;font-weight:900;color:${ACCENT};text-align:right;">₹${total}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:${CARD_BG};padding:32px 40px;text-align:center;border-bottom:1px solid #222;">
            <a href="http://localhost:3000/account/orders" style="display:inline-block;padding:14px 32px;background:${ACCENT};color:#000;font-weight:700;font-size:14px;letter-spacing:0.08em;text-decoration:none;border-radius:10px;text-transform:uppercase;">
              Track Your Order →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#080808;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#555;">© 2025 TEESINDIA™ · Premium Custom Apparel</p>
            <p style="margin:0;font-size:11px;color:#444;">You received this because you placed an order with us.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendOrderConfirmation(order: OrderForEmail): Promise<void> {
  await sendMail({
    to:      order.user.email,
    subject: `Order Confirmed #${order.id.toUpperCase().slice(0, 8)} — TEESINDIA™`,
    html:    renderOrderConfirmationEmail(order),
  });
}
