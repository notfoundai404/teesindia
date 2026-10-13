'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Invalid or missing reset token'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
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
          <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', marginTop: '0.75rem' }}>Set a new password</p>
        </div>

        <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: '0 4px 25px rgba(0,0,0,0.05)' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
              <h2 style={{ color: 'var(--white)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Password Changed</h2>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                Your password has been updated successfully. Redirecting you to sign in…
              </p>
              <Link href="/login" style={{ color: 'var(--white)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Go to Sign In
              </Link>
            </div>
          ) : !token ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ color: 'var(--white)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Invalid Reset Link</h2>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/forgot-password" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="rp-password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="rp-password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rp-confirm">Confirm Password</label>
                <input id="rp-confirm" type="password" className="form-input" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'underline', textUnderlineOffset: '3px' }}>← Back to Store</Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
