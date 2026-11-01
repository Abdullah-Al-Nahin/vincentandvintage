'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* Floating Messenger Bubble */}
      <a
        href="https://www.facebook.com"
        target="_blank"
        rel="noreferrer"
        title="Chat with Vincent & Vintage on Messenger"
        className="fixed bottom-18 lg:bottom-8 right-5 z-40 h-14 w-14 rounded-full bg-gradient-to-b from-[#00B1FF] to-[#006BFF] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-8 h-8 fill-white" />
      </a>

      <footer className="bg-[#4e3828] text-[#ede8dc] pt-16 pb-24 lg:pb-10 border-t border-[#d0a876]/40">
        <div className="max-w-[1450px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Col 1: Brand Logo, Hotline & Socials */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="bg-white px-5 py-2.5 rounded-xl shadow-md inline-block">
                <img
                  src="/brand/logo.png"
                  alt="Vincent & Vintage"
                  className="h-16 lg:h-18 w-auto object-contain"
                />
              </div>

              <p className="text-[#d0a876] text-3xl font-display font-bold mt-6 tracking-wider">
                +880 1730-642262
              </p>
              <p className="text-xs sm:text-sm text-[#f3efe6]/90 font-display uppercase tracking-widest mt-1 mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d0a876]" />
                <span>Worktime: SAT - FRI, 10AM - 11PM</span>
              </p>

              {/* Circular Bronze-Bordered Social Links */}
              <div className="flex gap-3">
                {['FB', 'IG', 'WA', 'YT'].map((label) => (
                  <a
                    key={label}
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="border border-[#d0a876]/60 text-[#d0a876] hover:bg-[#d0a876] hover:text-[#4e3828] rounded-full h-9 w-9 flex items-center justify-center text-xs font-bold transition-all shadow"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Information */}
            <div className="text-center lg:text-left">
              <h4 className="text-[#d0a876] text-base sm:text-lg uppercase mb-5 font-display tracking-widest font-bold">
                Information
              </h4>
              <ul className="space-y-3 text-sm font-display tracking-wider">
                <li>
                  <Link href="/" className="hover:text-[#d0a876] transition-colors">
                    About Vincent &amp; Vintage
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-[#d0a876] transition-colors">
                    Track Your Order (Live Courier Status)
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">Cash on Delivery &amp; Nationwide Delivery</span>
                </li>
                <li>
                  <span className="text-gray-400">Terms of Service &amp; Privacy</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact Info */}
            <div className="text-center lg:text-left">
              <h4 className="text-[#d0a876] text-base sm:text-lg uppercase mb-5 font-display tracking-widest font-bold">
                Contact Info
              </h4>
              <ul className="space-y-3.5 text-sm text-[#a3a8b5]">
                <li className="flex items-start justify-center lg:justify-start gap-2.5">
                  <MapPin className="w-5 h-5 text-[#d0a876] shrink-0 mt-0.5" />
                  <span>Dhaka, Bangladesh — Nationwide Home Delivery via Steadfast / Pathao</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start gap-2.5">
                  <Mail className="w-5 h-5 text-[#d0a876] shrink-0" />
                  <span>support@vincentandvintage.com</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start gap-2.5">
                  <Phone className="w-5 h-5 text-[#d0a876] shrink-0" />
                  <span>01730-642262 | 01948-898198</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Brand Showcase Card */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#4e3828] shadow-xl">
              <div className="h-28 relative">
                <img
                  src="/brand/cover.jpg"
                  alt="Vincent & Vintage Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#4e3828]/60 flex items-end p-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src="/brand/logo.png"
                      alt="Logo"
                      className="w-11 h-11 rounded-lg bg-white p-1 object-contain shadow"
                    />
                    <div>
                      <p className="text-white font-display font-bold text-sm sm:text-base leading-tight">
                        Vincent &amp; Vintage
                      </p>
                      <p className="text-xs text-[#d0a876]">
                        Premium Quality || Comfort || Classy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-gray-300">Official Brand Page</span>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#d0a876] text-[#4a392c] px-4 py-1.5 rounded-md font-display uppercase tracking-wider text-xs font-bold hover:bg-[#e0ba88]"
                >
                  Follow Page
                </a>
              </div>
            </div>
          </div>

          {/* Payment Methods Strip */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Vincent &amp; Vintage. Feel The Style. All Rights Reserved.</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs uppercase tracking-widest text-[#d0a876] font-display font-bold mr-1">
                Accepted:
              </span>
              {['Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'VISA', 'Mastercard'].map((pm) => (
                <span
                  key={pm}
                  className="px-3 py-1 rounded-md bg-[#4e3828] border border-white/10 text-[#ede8dc] text-xs font-display tracking-wider"
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
