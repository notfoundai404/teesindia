'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Calendar, Share2, Sparkles, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { blogApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await blogApi.get(params.slug);
        setPost(response.data?.post || response.data);
      } catch (error) {
        console.error(error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Article link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#0a0a0a] flex flex-col font-sans">
        <Navbar />
        <div style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow container mx-auto px-4 py-16 max-w-3xl animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8" />
          <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white text-[#0a0a0a] flex flex-col font-sans">
        <Navbar />
        <div style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <span className="text-[#C9A96E] text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Error 404
          </span>
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Story Not Found
          </h1>
          <p className="text-gray-500 text-sm max-w-md mb-8">
            The article you are searching for might have been retired or moved to the archives.
          </p>
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C9A96E] hover:text-black transition-all"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <ArrowLeft size={14} /> Return to Stories
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverImg = post.coverImage || post.image;
  const postDate = post.publishedAt || post.date || post.createdAt;
  const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'TEESINDIA');
  const readTime = post.readTime || '4 min read';
  const paragraphs = (post.content || '').split('\n\n');

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] flex flex-col font-sans selection:bg-[#C9A96E] selection:text-black">
      <Navbar />
      <CartDrawer />
      
      <main style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow pb-24">
        
        {/* ─── Breadcrumb ────────────────────────────────────── */}
        <div className="container mx-auto px-4 md:px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-[#C9A96E] truncate max-w-[200px] sm:max-w-md">{post.title}</span>
          </div>
        </div>

        {/* ─── Header Content ────────────────────────────────── */}
        <article className="container mx-auto px-4 md:px-6 py-12 max-w-3xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#a07f45] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
              <Sparkles size={12} className="text-[#C9A96E]" />
              {post.category || 'Editorial Story'}
            </div>

            <h1 
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-gray-900 leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-black text-[#C9A96E] flex items-center justify-center text-xs font-bold font-mono">
                    {authorName.charAt(0)}
                  </div>
                  <span className="text-gray-900 font-semibold">{authorName}</span>
                </div>
                {postDate && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Calendar size={13} />
                    {new Date(postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock size={13} />
                  {readTime}
                </span>
              </div>

              <button 
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-[#C9A96E] transition-colors"
                title="Copy share link"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          {/* Cover Hero Image */}
          {coverImg && (
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-12 border border-gray-200 shadow-md">
              <Image 
                src={coverImg} 
                alt={post.title} 
                fill 
                className="object-cover" 
                priority 
              />
            </div>
          )}

          {/* Body Content */}
          <div className="text-gray-800 text-base sm:text-lg leading-relaxed space-y-6">
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className="whitespace-pre-line leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="pt-12 mt-12 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:text-[#C9A96E] transition-colors"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <ArrowLeft size={16} /> Back to All Stories
            </Link>

            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white hover:bg-[#C9A96E] hover:text-black text-xs font-bold uppercase tracking-widest transition-all"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Explore Collection
            </Link>
          </div>

        </article>

      </main>

      <Footer />
    </div>
  );
}
