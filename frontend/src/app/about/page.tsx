'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useSettingsStore } from '@/lib/settingsStore';
import { motion, Variants } from 'framer-motion';
import { Sparkles, ShieldCheck, Scissors, ArrowRight, Compass, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  const { settings } = useSettingsStore();
  const brandName = settings.storeName || 'TEESINDIA';

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] flex flex-col font-sans selection:bg-[#C9A96E] selection:text-black">
      <Navbar />
      <CartDrawer />

      <main style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow w-full">
        
        {/* ─── Hero Section ───────────────────────────────────── */}
        <section className="relative w-full border-b border-gray-200 bg-[#fbfbfb] overflow-hidden py-20 md:py-32">
          {/* Subtle architectural grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#a07f45] text-[11px] font-bold tracking-[0.2em] uppercase mb-6">
                <Sparkles size={12} className="text-[#C9A96E]" />
                The Brand Archive // Est. 2024
              </div>

              <h1 
                className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-gray-900 leading-[1.05] mb-6"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Crafting The <br />
                <span className="text-[#C9A96E] italic font-serif lowercase">new</span> Streetwear Standard.
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
                {settings.tagline || 'Heavyweight 240+ GSM cotton, structural drop-shoulder cuts, and timeless silhouettes engineered for the modern Indian wardrobe.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── Brand Manifesto / Story ────────────────────────── */}
        <section className="relative w-full py-20 md:py-28 bg-white border-b border-gray-100">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Aesthetic Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl bg-[#0a0a0a] text-white p-8 md:p-12 overflow-hidden shadow-2xl border border-gray-800">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <span className="text-[#C9A96E] text-xs font-bold uppercase tracking-[0.2em] block mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    Original Philosophy
                  </span>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-6 leading-snug text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Rejecting fast-fashion compromise.
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    We started {brandName} because we couldn’t find heavyweight streetwear in India that retained its shape after three washes. Most brands chose cheap polyester blends. We chose 100% custom-spun combed cotton.
                  </p>

                  <div className="pt-6 border-t border-gray-800 flex items-center justify-between text-xs tracking-widest uppercase font-semibold text-gray-400">
                    <span>Authentic Indian Streetwear</span>
                    <span className="text-[#C9A96E]">240 GSM</span>
                  </div>
                </div>
              </div>

              {/* Right Narrative */}
              <div className="lg:col-span-7 space-y-6 text-gray-700 leading-relaxed text-base sm:text-lg">
                <div className="inline-block border-b-2 border-[#C9A96E] pb-1 mb-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                    Our Heritage & Mission
                  </span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  Heavyweight Fabric. Sculpted Fits. Zero Fluff.
                </h2>
                
                <p>
                  At <strong className="text-black">{brandName}</strong>, apparel is an architectural discipline. We study drape, shoulder decline, and ribbed collar memory before releasing a single piece. Every millimeter counts.
                </p>
                <p className="text-gray-600 text-base">
                  Every run is custom-knitted in small, carefully monitored batches. We preshrink our textiles, apply gentle bio-washes for a broken-in luxury feel from day one, and rigorously test seams so your tee looks just as sharp after year two as it does out of the box.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ─── The 4 Pillars ──────────────────────────────────── */}
        <section className="relative w-full py-20 md:py-28 bg-[#f9fafb] border-b border-gray-200">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A96E] block mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Built Different
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                The Standards We Refuse To Lower
              </h2>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                {
                  icon: <Scissors size={24} className="text-[#C9A96E]" />,
                  title: '240+ GSM Combed Cotton',
                  desc: 'Dense, substantial fabric that hangs cleanly without clinging. Breathable yet structurally commanding.'
                },
                {
                  icon: <ShieldCheck size={24} className="text-[#C9A96E]" />,
                  title: 'Reinforced Collars',
                  desc: 'High-density 1x1 lycra-ribbed necklines that retain tension and never bacon-wave wash after wash.'
                },
                {
                  icon: <Compass size={24} className="text-[#C9A96E]" />,
                  title: 'Drop-Shoulder Cut',
                  desc: 'Relaxed streetwear proportions precision-graded for Indian body types without excess bagginess.'
                },
                {
                  icon: <HeartHandshake size={24} className="text-[#C9A96E]" />,
                  title: 'Made In India',
                  desc: 'Proudly sourced, dyed, and sewn in premier Indian textile hubs with fair ethical craftsmanship.'
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={fadeUp}
                  className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:border-[#C9A96E]/60 hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Stats Banner ───────────────────────────────────── */}
        <section className="relative w-full py-16 md:py-20 bg-[#0a0a0a] text-white border-b border-gray-900">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
              {[
                { value: '240+', label: 'GSM Density Standard' },
                { value: '10K+', label: 'Community Deliveries' },
                { value: '4.9★', label: 'Average Fitting Rating' },
                { value: '100%', label: 'Pure Combed Cotton' },
              ].map((stat, i) => (
                <div key={i} className="pt-6 md:pt-0">
                  <p className="text-4xl md:text-5xl font-black text-[#C9A96E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Call to Action ─────────────────────────────────── */}
        <section className="relative w-full py-24 md:py-32 bg-white text-center">
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A96E] block mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Ready To Upgrade?
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Experience The Weight.
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Discover our latest drop of heavyweight oversized tees and essentials engineered for everyday luxury.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/shop"
                className="about-cta-black inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-black/10 hover:-translate-y-0.5 cursor-pointer"
                style={{ 
                  fontFamily: 'var(--font-heading)',
                  backgroundColor: '#0a0a0a',
                  color: '#ffffff',
                }}
              >
                <span style={{ color: '#ffffff' }}>Browse All Drops</span>
                <ArrowRight size={16} color="#ffffff" />
              </Link>
              <Link 
                href="/collections"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-gray-900 hover:bg-gray-100 border border-gray-300 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                View Collections
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
