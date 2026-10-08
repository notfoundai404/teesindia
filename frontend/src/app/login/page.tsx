'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push(res.data.user.role === 'ADMIN' ? '/admin' : '/account');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img src="/logo.svg" alt="TEESINDIA" style={{ height: '44px', width: 'auto', margin: '0 auto', display: 'block' }} />
          </Link>
          <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', marginTop: '0.75rem' }}>Sign in to your account</p>
        </div>

        <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: '0 4px 25px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input id="login-email" type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="login-password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--grey-400)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--grey-400)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--white)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Create one</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'underline', textUnderlineOffset: '3px' }}>← Back to Store</Link>
        </div>
      </div>
    </main>
  );
}
