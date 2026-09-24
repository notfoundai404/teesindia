'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { blogApi } from '@/lib/api';
import { motion, Variants } from 'framer-motion';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

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

  // Compute categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter((p) => (p.category || 'Story').toLowerCase() === activeCategory.toLowerCase());
  }, [posts, activeCategory]);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  // Helper component for post visual banner
  const renderCover = (post: any, isFeatured = false) => {
    const coverImg = post.coverImage || post.image;
    return (
      <div className={`relative w-full overflow-hidden ${isFeatured ? 'h-64 sm:h-80 md:h-full min-h-[260px]' : 'aspect-[16/10] bg-gray-100'}`}>
        {coverImg ? (
          <Image 
            src={coverImg} 
            alt={post.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700 ease-out">
            {/* Subtle luxury glow effect */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A96E]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center mb-4 text-[#C9A96E]">
                <Sparkles size={20} />
              </div>
              <span className="text-[#C9A96E] text-xs font-bold uppercase tracking-[0.25em] block mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                TEESINDIA™ Archive
              </span>
              <p className="text-gray-400 text-xs uppercase tracking-widest max-w-[200px]">
                Heavyweight 240+ GSM Essentials
              </p>
            </div>
          </div>
        )}

        {/* Category Pill Tag */}
        <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-[#C9A96E] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#C9A96E]/30 shadow-md z-10">
          {post.category || 'Story'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] flex flex-col font-sans selection:bg-[#C9A96E] selection:text-black">
      <Navbar />
      <CartDrawer />
      
      <main style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow w-full pb-28">
        
        {/* ─── Hero Header ───────────────────────────────────── */}
        <section className="relative w-full bg-[#fbfbfb] border-b border-gray-200 py-20 md:py-28 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#a07f45] text-[11px] font-bold tracking-[0.2em] uppercase mb-5">
                <Sparkles size={12} className="text-[#C9A96E]" />
                The Journal // Editorial
              </div>

              <h1 
                className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-gray-900 mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Lookbook & Stories
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
                Style tips, brand updates, and a glimpse behind the scenes at Teesindia.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── Category Filter Pills ─────────────────────────── */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10">
          <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'}
            </span>
          </div>
        </div>

        {/* ─── Articles Content ──────────────────────────────── */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex flex-col bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="w-full aspect-[16/10] bg-gray-100 rounded-xl mb-5" />
                  <div className="w-20 h-4 bg-gray-100 rounded-full mb-3" />
                  <div className="w-full h-6 bg-gray-100 rounded mb-2" />
                  <div className="w-3/4 h-6 bg-gray-100 rounded mb-4" />
                  <div className="w-full h-12 bg-gray-100 rounded mb-6" />
                  <div className="w-28 h-4 bg-gray-100 rounded mt-auto" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300 max-w-xl mx-auto p-8">
              <BookOpen size={40} className="text-[#C9A96E] mx-auto mb-4 opacity-75" />
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                No Stories Found
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                We haven&apos;t published stories in this category yet. Check back soon for new drops and guides.
              </p>
              <button 
                onClick={() => setActiveCategory('All')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#C9A96E] hover:text-black transition-all"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                View All Stories
              </button>
            </div>
          ) : filteredPosts.length === 1 ? (
            /* ─── Single Featured Editorial Layout ──────────────── */
            (() => {
              const post = filteredPosts[0];
              const postDate = post.publishedAt || post.date || post.createdAt;
              const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'TEESINDIA');
              const readTime = post.readTime || '4 min read';

              return (
                <motion.article 
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="group grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#C9A96E]/50 hover:shadow-xl transition-all duration-300"
                >
                  {/* Left Media Column */}
                  <Link href={`/blog/${post.slug}`} className="md:col-span-6 block relative overflow-hidden bg-gray-100">
                    {renderCover(post, true)}
                  </Link>

                  {/* Right Content Column */}
                  <div className="md:col-span-6 flex flex-col justify-center p-8 md:p-12 lg:p-14">
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 font-medium">
                      {postDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        {readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`}>
                      <h2 
                        className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-gray-900 group-hover:text-[#C9A96E] transition-colors duration-200 mb-4 leading-snug"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Author & Button */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0a0a0a] text-[#C9A96E] flex items-center justify-center text-xs font-bold uppercase font-mono shadow-sm">
                          {authorName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{authorName}</span>
                          <span className="text-[11px] text-gray-400">Editorial Staff</span>
                        </div>
                      </div>

                      <Link 
                        href={`/blog/${post.slug}`} 
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a0a0a] text-white hover:bg-[#C9A96E] hover:text-black text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md group-hover:translate-x-0.5"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        Read Full Story <ArrowRight size={14} />
                      </Link>
                    </div>

                  </div>
                </motion.article>
              );
            })()
          ) : (
            /* ─── Multi-post Grid ───────────────────────────────── */
            <motion.div 
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPosts.map((post) => {
                const postDate = post.publishedAt || post.date || post.createdAt;
                const authorName = post.author?.name || (typeof post.author === 'string' ? post.author : 'TEESINDIA');
                const readTime = post.readTime || '4 min read';

                return (
                  <motion.article 
                    key={post.id || post.slug} 
                    variants={fadeUp}
                    className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#C9A96E]/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                  >
                    {/* Cover Thumbnail */}
                    <Link href={`/blog/${post.slug}`} className="block relative bg-gray-100 overflow-hidden">
                      {renderCover(post, false)}
                    </Link>
                    
                    {/* Content */}
                    <div className="flex flex-col flex-grow p-6 sm:p-7">
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 font-medium">
                        {postDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-gray-400" />
                            {new Date(postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-gray-400" />
                          {readTime}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <Link href={`/blog/${post.slug}`}>
                        <h2 
                          className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-gray-900 group-hover:text-[#C9A96E] transition-colors duration-200 line-clamp-2 mb-3 leading-snug"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {post.title}
                        </h2>
                      </Link>
                      
                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      {/* Author & Read Link */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-[#C9A96E] flex items-center justify-center text-xs font-bold uppercase font-mono">
                            {authorName.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-gray-800">{authorName}</span>
                        </div>
                        
                        <Link 
                          href={`/blog/${post.slug}`} 
                          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black group-hover:text-[#C9A96E] transition-colors"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          Read Story <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
