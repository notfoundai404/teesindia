'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'brand',
    tags: '',
    isPublished: false,
  });

  // Auto-generate slug from title
  useEffect(() => {
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setForm((f) => ({ ...f, slug }));
  }, [form.title]);

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/blog', {
        ...form,
        publishedAt: form.isPublished ? new Date().toISOString() : undefined,
      });
      toast.success('Story published successfully');
      router.push('/admin/blog');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = ['brand', 'style', 'lookbook', 'news', 'sustainability'];

  const actionButton = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Link
        href="/admin/blog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#4b5563',
          fontSize: '0.85rem',
          textDecoration: 'none',
          padding: '0.5rem 0.75rem',
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={16} /> Back to Blog
      </Link>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#000000',
          color: '#ffffff',
          fontWeight: 600,
          padding: '0.55rem 1.25rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Save size={16} /> {loading ? 'Saving...' : form.isPublished ? 'Publish Story' : 'Save Draft'}
      </button>
    </div>
  );

  return (
    <AdminLayout title="Create New Story" action={actionButton}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem', paddingBottom: '3rem' }}>
          {/* Main Form Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.35rem' }}>
                  Story Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Craft of Heavyweight Combed Cotton"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    color: '#111827',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.35rem' }}>
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="craft-of-heavyweight-cotton"
                  value={form.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    color: '#374151',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.35rem' }}>
                  Short Excerpt / Teaser
                </label>
                <textarea
                  placeholder="A one-sentence overview displayed on editorial listing cards..."
                  value={form.excerpt}
                  onChange={(e) => update('excerpt', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    color: '#111827',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.35rem' }}>
                  Article Content * (Markdown Supported)
                </label>
                <textarea
                  placeholder="Write editorial markdown content here..."
                  value={form.content}
                  onChange={(e) => update('content', e.target.value)}
                  required
                  rows={18}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0.85rem',
                    color: '#111827',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
                Publishing Settings
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => update('isPublished', e.target.checked)}
                  style={{ accentColor: '#000000', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#111827' }}>
                  Publish immediately live
                </span>
              </label>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                Categorization
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.35rem' }}>
                  Editorial Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    color: '#111827',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.35rem' }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="streetwear, luxury, cotton"
                  value={form.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    color: '#111827',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
