import { sendMail } from '../lib/mailer';

const ACCENT = '#C9A96E';
const BG = '#0a0a0a';
const CARD_BG = '#111111';
const TEXT = '#ffffff';
const MUTED = '#888888';

export function renderPasswordResetEmail(resetUrl: string, name: string): string {
  return `
<body style="margin:0;padding:0;background:${BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${CARD_BG};border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:32px 28px;">
          <div style="text-align:center;margin-bottom:8px;">
            <span style="font-family:Impact, sans-serif;font-size:26px;letter-spacing:0.2em;color:${ACCENT};text-transform:uppercase;">TEESINDIA</span>
          </div>
          <h1 style="font-family:Inter, Arial, sans-serif;font-size:22px;color:${TEXT};text-align:center;margin:0 0 12px 0;">Reset Your Password</h1>
          <p style="font-family:Inter, Arial, sans-serif;font-size:14px;color:${MUTED};text-align:center;line-height:1.6;margin:0 0 24px 0;">
            Hi ${name || 'there'},<br/>
            We received a request to reset your password. Click the button below to set a new one.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background:${ACCENT};color:#000000;font-family:Inter, Arial, sans-serif;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.05em;">RESET PASSWORD</a>
            </td></tr>
          </table>
          <p style="font-family:Inter, Arial, sans-serif;font-size:12px;color:${MUTED};text-align:center;line-height:1.6;margin:0 0 8px 0;">
            This link expires in 30 minutes. If you did not request a password reset, you can safely ignore this email.
          </p>
          <p style="font-family:Inter, Arial, sans-serif;font-size:12px;color:${MUTED};text-align:center;line-height:1.6;margin:0;word-break:break-all;">
            Link: ${resetUrl}
          </p>
        </td></tr>
        <tr><td style="background:#0d0d0d;padding:16px 28px;text-align:center;">
          <p style="font-family:Inter, Arial, sans-serif;font-size:11px;color:#555;margin:0;">© 2025 TEESINDIA™ · Premium Custom Apparel</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
  `.trim();
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  await sendMail({
    to,
    subject: 'Reset Your Password — TEESINDIA™',
    html: renderPasswordResetEmail(resetUrl, name),
  });
}
