'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { blogApi } from '@/lib/api';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-[112px]">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center pt-[112px] px-4 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
            Return to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverImg = post.coverImage || post.image;
  const postDate = post.publishedAt || post.date || post.createdAt;
  const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'Teesindia');
  const paragraphs = (post.content || '').split('\n\n');

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <Navbar />
      <CartDrawer />
      
      <main style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow">
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-black truncate">{post.title}</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="w-full h-[50vh] min-h-[300px] max-h-[500px] relative bg-gradient-to-r from-gray-900 to-gray-800">
          {coverImg && (
            <Image 
              src={coverImg} 
              alt={post.title} 
              fill 
              className="object-cover opacity-80"
              priority
            />
          )}
        </div>

        {/* Content */}
        <article className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-gray-100 text-xs font-bold uppercase tracking-widest mb-6">
              {post.category || 'Story'}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500">
              <span>By {authorName}</span>
              {postDate && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{new Date(postDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </>
              )}
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className="mb-6 whitespace-pre-line">{p}</p>
            ))}
          </div>
        </article>

        {/* Bottom Nav */}
        <div className="border-t border-gray-200">
          <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 px-6 py-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
