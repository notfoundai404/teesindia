'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { blogApi } from '@/lib/api';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await blogApi.list();
        const data = response.data?.posts || response.data || [];
        setPosts(data);
      } catch (error) {
        console.error(error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <Navbar />
      <CartDrawer />
      
      <main style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow container mx-auto px-4 pb-20">
        
        {/* Hero */}
        <div className="py-16 md:py-24 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4">Lookbook & Stories</h1>
          <p className="text-lg text-gray-500 font-light">Style tips, brand updates, and behind-the-scenes at Teesindia.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="animate-pulse flex flex-col">
                <div className="w-full aspect-[4/3] bg-gray-200 mb-4"></div>
                <div className="w-24 h-4 bg-gray-200 mb-3"></div>
                <div className="w-full h-8 bg-gray-200 mb-2"></div>
                <div className="w-3/4 h-8 bg-gray-200 mb-4"></div>
                <div className="w-full h-16 bg-gray-200 mb-4"></div>
                <div className="w-32 h-4 bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300">
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">No Posts Yet</h2>
            <p className="text-gray-500">Check back soon for updates and stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {posts.map(post => {
              const coverImg = post.coverImage || post.image;
              const postDate = post.publishedAt || post.date || post.createdAt;
              const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'Teesindia');
              return (
                <article key={post.id} className="group flex flex-col h-full">
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden mb-5">
                    {coverImg ? (
                      <Image src={coverImg} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-gray-900 to-gray-500 group-hover:scale-105 transition-transform duration-700"></div>
                    )}
                  </Link>
                  
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3 text-xs font-bold uppercase tracking-widest">
                      <span className="text-black">{post.category || 'Story'}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">{postDate ? new Date(postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-2xl font-bold uppercase tracking-wide mb-3 leading-tight group-hover:underline decoration-2 underline-offset-4">{post.title}</h2>
                    </Link>
                    
                    <p className="text-gray-600 mb-6 flex-grow line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-500">By {authorName}</span>
                      <Link href={`/blog/${post.slug}`} className="text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
