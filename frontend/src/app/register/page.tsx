'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      setUser(res.data.user);
      toast.success('Account created! Welcome to TEESINDIA.');
      router.push('/account');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img src="/logo.svg" alt="TEESINDIA" style={{ height: '44px', width: 'auto', margin: '0 auto', display: 'block' }} />
          </Link>
          <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem', marginTop: '0.75rem' }}>Create your account</p>
        </div>

        <div style={{ background: 'var(--black-card)', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: '0 4px 25px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="form-input" placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <input id="reg-phone" type="tel" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="reg-password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" className="form-input" placeholder="••••••••" value={form.confirm} onChange={e => update('confirm', e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : 'Create Account'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--grey-400)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--white)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Sign in</Link>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'underline', textUnderlineOffset: '3px' }}>← Back to Store</Link>
        </div>
      </div>
    </main>
  );
}
