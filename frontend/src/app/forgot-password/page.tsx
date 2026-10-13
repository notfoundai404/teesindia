'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img src="/logo.svg" alt="TEESINDIA" style={{ height: '44px', width: 'auto', margin: '0 auto', display: 'block' }} />
          </Link>
          <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', marginTop: '0.75rem' }}>Reset your password</p>
        </div>

        <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: '0 4px 25px rgba(0,0,0,0.05)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
              <h2 style={{ color: 'var(--white)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Check your email</h2>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                If an account exists for <strong style={{ color: 'var(--white)' }}>{email}</strong>, we&apos;ve sent a password reset link.
              </p>
              <Link href="/login" style={{ display: 'inline-block', color: 'var(--white)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="fp-email">Email Address</label>
                <input id="fp-email" type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!sent && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--grey-400)' }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: 'var(--white)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Sign in</Link>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'underline', textUnderlineOffset: '3px' }}>← Back to Store</Link>
        </div>
      </div>
    </main>
  );
}
