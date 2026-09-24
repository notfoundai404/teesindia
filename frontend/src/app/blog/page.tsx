'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { blogApi } from '@/lib/api';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-black selection:text-white">
      <Navbar />
      <CartDrawer />
      
      <main className="flex-grow pt-[120px] pb-24">
        
        {/* Hero */}
        <section className="relative bg-white border-b border-gray-200">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
          <div className="container mx-auto px-4 py-20 md:py-32 relative z-10 text-center max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 block">The Journal</span>
              <h1 className="text-5xl md:text-7xl font-extrabold font-heading tracking-tight mb-6 text-black">Lookbook & Stories</h1>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Style tips, brand updates, and a glimpse behind the scenes at Teesindia.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 pt-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse flex flex-col bg-white p-4 rounded-3xl border border-gray-100">
                  <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl mb-6"></div>
                  <div className="w-24 h-4 bg-gray-100 rounded mb-4"></div>
                  <div className="w-full h-8 bg-gray-100 rounded mb-3"></div>
                  <div className="w-3/4 h-8 bg-gray-100 rounded mb-4"></div>
                  <div className="w-full h-16 bg-gray-100 rounded mb-6"></div>
                  <div className="w-32 h-4 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-300">
              <h2 className="text-2xl font-bold font-heading mb-3">No Stories Yet</h2>
              <p className="text-gray-500">Check back soon for our latest updates and lookbooks.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post, index) => {
                const coverImg = post.coverImage || post.image;
                const postDate = post.publishedAt || post.date || post.createdAt;
                const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'Teesindia');
                return (
                  <motion.article 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    key={post.id} 
                    className="group flex flex-col h-full bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2"
                  >
                    <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden m-3 rounded-3xl">
                      {coverImg ? (
                        <Image src={coverImg} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-50 group-hover:scale-105 transition-transform duration-[1.2s] ease-out"></div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    </Link>
                    
                    <div className="flex flex-col flex-grow p-6 pt-4">
                      <div className="flex items-center gap-3 mb-4 text-xs font-bold uppercase tracking-widest">
                        <span className="text-black bg-gray-100 px-3 py-1 rounded-full">{post.category || 'Story'}</span>
                        <span className="text-gray-400 font-medium">{postDate ? new Date(postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                      </div>
                      
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-2xl font-bold font-heading mb-3 leading-[1.3] text-gray-900 group-hover:text-gray-600 transition-colors">{post.title}</h2>
                      </Link>
                      
                      <p className="text-gray-500 mb-8 flex-grow line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
                            {authorName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{authorName}</span>
                        </div>
                        <Link href={`/blog/${post.slug}`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
