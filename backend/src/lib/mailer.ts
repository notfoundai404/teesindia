/**
 * backend/src/lib/mailer.ts
 *
 * Nodemailer singleton — call sendMail() to send any transactional email.
 * Configure via environment variables:
 *   SMTP_HOST   e.g. smtp.gmail.com
 *   SMTP_PORT   e.g. 587
 *   SMTP_USER   e.g. yourname@gmail.com
 *   SMTP_PASS   e.g. 16-char Gmail App Password (or Brevo/Resend API key)
 *   SMTP_FROM   e.g. "TEESINDIA <yourname@gmail.com>"
 */

import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function verifySMTP(): Promise<{ success: boolean; message: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: false, message: 'SMTP_USER or SMTP_PASS is missing in backend .env' };
  }
  try {
    await getTransporter().verify();
    return { success: true, message: 'SMTP credentials verified successfully.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to verify SMTP credentials.' };
  }
}

export async function sendMail(opts: {
  to:      string;
  subject: string;
  html:    string;
}): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP credentials not set — skipping email to:', opts.to);
    return;
  }

  try {
    await getTransporter().sendMail({
      from:    process.env.SMTP_FROM || process.env.SMTP_USER,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
    });
    console.log('[mailer] Email sent to:', opts.to, '—', opts.subject);
  } catch (err) {
    console.error('[mailer] Failed to send email:', err);
  }
}
