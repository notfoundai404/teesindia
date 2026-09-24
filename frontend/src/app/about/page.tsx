'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useSettingsStore } from '@/lib/settingsStore';
import { motion, Variants } from 'framer-motion';

export default function AboutPage() {
  const { settings } = useSettingsStore();
  const brandName = settings.storeName || 'Teesindia';

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white flex flex-col">
      <Navbar /><CartDrawer />
      
      <main className="flex-grow pt-[112px]">
        
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 px-4 overflow-hidden bg-gray-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp}
            className="container mx-auto max-w-4xl text-center relative z-10"
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 block">Our Story</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight mb-8 text-black leading-none">
              Defining the <br/><span className="text-gray-400 italic font-light">New Classic.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {settings.tagline || 'Crafting premium essentials for the modern wardrobe. Where uncompromising quality meets everyday style.'}
            </p>
          </motion.div>
        </section>

        {/* Brand Story Section */}
        <section className="py-24 md:py-32 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}
                className="aspect-square bg-gray-100 rounded-[3rem] p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <span className="font-heading font-black text-[12rem] tracking-tighter">EST.</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold font-heading mb-8 text-black tracking-tight">The Beginning</h2>
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                  <p>
                    <strong className="text-black">{brandName}</strong> was founded with a simple mission — make premium quality clothing accessible to everyone in India. We believe in creating clothing that lasts, that feels great, and that you're proud to wear.
                  </p>
                  <p>
                    Frustrated by the fast-fashion industry's compromise on fabric quality and fit, we set out to build a brand that focuses on the fundamentals. Every piece we make undergoes rigorous testing to ensure it stands the test of time.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Row Modernized */}
        <section className="py-16 md:py-24 bg-black text-white px-4 border-y border-gray-900">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 text-center divide-x divide-gray-800"
            >
              {[
                { label: 'Customers', value: '10,000+' },
                { label: 'Styles', value: '50+' },
                { label: 'Years', value: '5' },
                { label: 'Cotton', value: '100%' },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="flex flex-col items-center justify-center">
                  <p className="text-4xl md:text-5xl font-black font-heading mb-3">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 md:py-32 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 tracking-tight text-black">What We Stand For</h2>
              <p className="text-gray-500 max-w-xl mx-auto">The core principles that guide every stitch and seam.</p>
            </div>
            
            <motion.div 
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { id: '01', title: 'Quality First', desc: 'We source only the finest materials. Our signature heavyweight cotton is custom-milled to ensure unparalleled comfort and durability wash after wash.' },
                { id: '02', title: 'Community Built', desc: "Built for and by the Indian youth. We actively listen to our community's feedback, incorporating your ideas into our design process." },
                { id: '03', title: 'Sustainability', desc: "We're working towards a greener future. By creating long-lasting garments instead of disposable fashion, we aim to reduce waste." }
              ].map((val) => (
                <motion.div key={val.id} variants={fadeUp} className="bg-white p-10 rounded-[2rem] border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
                  <div className="text-4xl font-black font-heading text-gray-200 mb-8">{val.id}</div>
                  <h3 className="text-xl font-bold uppercase tracking-wide mb-4 text-black">{val.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {val.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Born in India Section CTA */}
        <section className="py-32 md:py-48 px-4 bg-white text-center">
          <div className="container mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-6xl md:text-8xl font-black font-heading uppercase tracking-tighter mb-6 text-black leading-none">Born in India.</h2>
              <p className="text-xl md:text-2xl font-medium text-gray-500 mb-12 max-w-xl mx-auto">
                Proudly designed, sourced, and manufactured locally.
              </p>
              <Link 
                href="/shop"
                className="inline-flex items-center justify-center bg-black text-white px-10 py-5 rounded-2xl text-sm uppercase tracking-widest font-bold hover:bg-gray-900 transition-all hover:scale-105 shadow-xl shadow-black/20"
              >
                Explore The Collection
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
