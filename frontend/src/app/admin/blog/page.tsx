'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { blogApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, FileText } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  category?: string;
  author: { name: string };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi
      .list({ limit: 50 })
      .then((res) => setPosts(res.data.posts || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      const api = (await import('@/lib/api')).default;
      await api.delete(`/blog/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const actionButton = (
    <Link
      href="/admin/blog/new"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#000000',
        color: '#ffffff',
        padding: '0.6rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        fontSize: '0.875rem',
        textDecoration: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Plus size={16} /> New Article
    </Link>
  );

  return (
    <AdminLayout title="Blog Publications" action={actionButton}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '80px',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <FileText size={36} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>No editorial stories published yet</p>
          <Link
            href="/admin/blog/new"
            style={{
              background: '#000000',
              color: '#ffffff',
              fontWeight: 600,
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Create your first story
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {post.title}
                  </span>
                  <span
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      background: post.isPublished ? '#dcfce7' : '#f3f4f6',
                      color: post.isPublished ? '#166534' : '#6b7280',
                      border: `1px solid ${post.isPublished ? '#bbf7d0' : '#e5e7eb'}`,
                      flexShrink: 0,
                    }}
                  >
                    {post.isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                  By {post.author?.name || 'Admin'} ·{' '}
                  {new Date(post.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {post.category && ` · ${post.category.toUpperCase()}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  title="View story"
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563',
                    textDecoration: 'none',
                  }}
                >
                  <Eye size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  title="Delete story"
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid #fee2e2',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                    background: '#fee2e2',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
