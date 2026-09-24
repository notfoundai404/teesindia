'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useSettingsStore } from '@/lib/settingsStore';

export default function AboutPage() {
  const { settings } = useSettingsStore();
  const brandName = settings.storeName || 'Teesindia';

  return (
    <><Navbar /><CartDrawer />
      <main style={{ paddingTop: 'calc(40px + 72px)', minHeight: '100vh', background: 'var(--black)' }}>
        {/* Hero Section */}
        <section className="bg-white text-black py-24 md:py-32 px-4 text-center border-b border-gray-200">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-6 text-black">Our Story</h1>
            <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              {settings.tagline || 'Crafting premium essentials for the modern Indian wardrobe. Quality meets everyday style.'}
            </p>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 text-black">The Beginning</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed md:text-lg text-left md:text-center">
              <p>
                {brandName} was founded with a simple mission — make premium quality clothing accessible to everyone in India. We believe in creating clothing that lasts, that feels great, and that you're proud to wear.
              </p>
              <p>
                Frustrated by the fast-fashion industry's compromise on fabric quality and fit, we set out to build a brand that focuses on the fundamentals. Every piece we make undergoes rigorous testing to ensure it stands the test of time.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="py-16 bg-gray-50 px-4 border-y border-gray-200">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
              <div>
                <p className="text-4xl font-bold mb-2 text-black">10,000+</p>
                <p className="text-sm uppercase tracking-widest text-gray-500">Customers</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2 text-black">50+</p>
                <p className="text-sm uppercase tracking-widest text-gray-500">Styles</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2 text-black">5</p>
                <p className="text-sm uppercase tracking-widest text-gray-500">Years</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2 text-black">100%</p>
                <p className="text-sm uppercase tracking-widest text-gray-500">Cotton</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold uppercase tracking-wider mb-16 text-center text-black">What We Stand For</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 text-black border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
                <h3 className="text-xl font-bold uppercase tracking-wide mb-4 text-black">Quality First</h3>
                <p className="text-gray-600 leading-relaxed">
                  We source only the finest materials. Our signature heavyweight cotton is custom-milled to ensure unparalleled comfort and durability wash after wash.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 text-black border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
                <h3 className="text-xl font-bold uppercase tracking-wide mb-4 text-black">Community Built</h3>
                <p className="text-gray-600 leading-relaxed">
                  Built for and by the Indian youth. We actively listen to our community's feedback, incorporating your ideas into our design process to create what you actually want to wear.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 text-black border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
                <h3 className="text-xl font-bold uppercase tracking-wide mb-4 text-black">Sustainability</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're working towards a greener future. By creating long-lasting garments instead of disposable fashion, we aim to reduce waste and promote mindful consumption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Born in India Section */}
        <section className="py-32 px-4 bg-gray-50 text-black text-center border-t border-gray-200">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 opacity-90 text-black">Born in India.</h2>
            <p className="text-xl md:text-2xl font-light text-gray-600 mb-12">
              Proudly designed, sourced, and manufactured locally.
            </p>
            <Link 
              href="/shop"
              className="inline-block bg-black text-white px-10 py-4 uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors shadow-md rounded-sm"
            >
              Shop the Collection
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
