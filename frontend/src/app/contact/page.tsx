'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Check } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/settingsStore';

export default function ContactPage() {
  const { settings } = useSettingsStore();
  const [formData, setFormData] = useState({
    name: '', email: '', subject: 'General Inquiry', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <Navbar />
      <CartDrawer />
      
      <main style={{ paddingTop: 'calc(40px + 72px)' }} className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4">Get In Touch</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">Have a question about your order, our products, or just want to say hello? We'd love to hear from you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            {/* Left: Contact Info */}
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-8 border-b border-gray-200 pb-4">Contact Information</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider mb-1">Email Us</h3>
                    <a href={`mailto:${settings.supportEmail || 'support@teesindia.com'}`} className="text-gray-600 hover:text-black">
                      {settings.supportEmail || 'support@teesindia.com'}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">We usually respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider mb-1">Call Us</h3>
                    <a href={`tel:${(settings.supportPhone || '+91 98765 43210').replace(/\s+/g, '')}`} className="text-gray-600 hover:text-black">
                      {settings.supportPhone || '+91 98765 43210'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider mb-1">Visit Us</h3>
                    <p className="text-gray-600">Mumbai, India</p>
                    <p className="text-sm text-gray-500 mt-1">HQ & Design Studio (By appointment only)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday - Saturday</p>
                    <p className="text-gray-600">10:00 AM - 7:00 PM (IST)</p>
                  </div>
                </div>
              </div>

              {(settings.instagramUrl || settings.twitterUrl) && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="font-bold uppercase tracking-wider mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {settings.instagramUrl && (
                      <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                        <span className="sr-only">Instagram</span>
                        IG
                      </a>
                    )}
                    {settings.twitterUrl && (
                      <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                        <span className="sr-only">Twitter</span>
                        TW
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Contact Form */}
            <div>
              <div className="bg-gray-50 p-8">
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Send a Message</h2>
                
                {isSuccess ? (
                  <div className="bg-green-50 border border-green-200 p-6 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-wider text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-700">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black bg-white"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Subject</label>
                      <div className="relative">
                        <select 
                          required
                          value={formData.subject}
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                          className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black bg-white appearance-none"
                        >
                          <option>General Inquiry</option>
                          <option>Order Issue</option>
                          <option>Returns & Exchanges</option>
                          <option>Feedback</option>
                          <option>Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Message</label>
                      <textarea 
                        required
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        rows={5}
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black bg-white resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black text-white py-4 uppercase tracking-widest font-bold hover:bg-gray-900 transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
