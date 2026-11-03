'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Phone,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  Home,
  LayoutGrid,
  PackageSearch
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function Navbar({
  onSearchChange,
  activeCategory = 'all',
  onSelectCategory,
  categories = []
}) {
  const {
    cartCount,
    cartSubtotal,
    wishlist,
    setCartDrawerOpen,
    setAuthModalOpen,
    user
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) onSearchChange(searchText);
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ========================================================
          1. LUXURY ATELIER TOP UTILITY RIBBON
          ======================================================== */}
      <div className="bg-[#4e3828] text-white text-[11px] py-2 px-4 sm:px-8 border-b border-[#a8825b]/30">
        <div className="max-w-[1450px] mx-auto flex items-center justify-between tracking-[0.14em] font-display uppercase font-medium">
          {/* Left: Atelier Heritage Notice */}
          <div className="hidden lg:flex items-center gap-2 text-[#cbbba6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f4b66b] animate-ping" />
            <span>Old Money Heritage Tailoring &bull; Atelier Dhaka</span>
          </div>

          {/* Center: Nationwide Shipping & COD */}
          <div className="flex items-center gap-2 text-center mx-auto lg:mx-0">
            <span className="text-[#f4b66b] font-bold">Vincent &amp; Vintage</span>
            <span className="text-[#a8825b]">&bull;</span>
            <span>Cash on Delivery Nationwide</span>
            <span className="hidden sm:inline text-[#a8825b]">&bull;</span>
            <span className="hidden sm:inline text-[#ede8dc]">Premium Atelier Quality</span>
          </div>

          {/* Right: Customer Utilities (Track Order, Client Services) */}
          <div className="hidden md:flex items-center gap-4 text-[11px] text-[#cbbba6]">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 hover:text-[#f4b66b] transition-colors"
              title="Track Live Dispatch"
            >
              <PackageSearch className="w-3.5 h-3.5 text-[#a8825b]" />
              <span>Track Order</span>
            </Link>

            <span className="text-[#a8825b]/40">&bull;</span>

            <span className="text-[#ede8dc] font-semibold">
              Official Store
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MOBILE HEADER & QUICK ACTION BAR (lg:hidden)
          ======================================================== */}
      <div className="sticky top-0 z-50 bg-[#f6f3eb]/95 backdrop-blur-md border-b border-[#e3ded3] w-full lg:hidden">
        <div className="flex justify-between items-center h-16 sm:h-18 px-3.5 sm:px-4">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-[#3d2b1f] hover:text-[#a8825b] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Centered Brand Crest Logo */}
          <Link
            href="/"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('all');
            }}
            className="flex items-center justify-center py-1"
          >
            <img
              src="/brand/logo.png"
              alt="Vincent & Vintage"
              width={160}
              height={52}
              fetchPriority="high"
              decoding="async"
              className="h-11 sm:h-13 w-auto object-contain crisp-logo"
            />
          </Link>

          {/* Right Mobile Actions: Search Toggle + Cart Bag */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className={`p-2 rounded-full transition-colors ${mobileSearchOpen ? 'bg-[#ede8dc] text-[#a8825b]' : 'text-[#3d2b1f]'
                }`}
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 rounded-full border border-[#d8d2c4] bg-[#fcfbf7] text-[#3d2b1f] hover:border-[#a8825b] transition-all shadow-2xs"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 text-[#4e3828]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-[#a8825b] text-[10px] text-white rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Mobile Search Dropdown */}
        {mobileSearchOpen && (
          <div className="px-3.5 pb-3 pt-1 border-t border-[#e8e4db] bg-[#fcfbf7] animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search linen shirts, gurkha pants, polos..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  className="w-full bg-[#ede8dc] border border-[#d8d2c4] rounded-xl pl-9 pr-8 py-2.5 text-base text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
                <Search className="w-4 h-4 text-[#a8825b] absolute left-3 top-1/2 -translate-y-1/2" />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText('');
                      if (onSearchChange) onSearchChange('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#4e3828] text-white px-4 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider font-bold shrink-0"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Horizontal Mobile Category Swiper */}
        <div className="border-t border-[#e8e4db] px-3.5 py-2.5 overflow-x-auto no-scrollbar touch-scroll bg-[#f8f5ee]">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory('all');
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer ${activeCategory === 'all'
                ? 'bg-[#4e3828] text-white shadow-xs'
                : 'bg-[#fcfbf7] text-[#554336] border border-[#d8d2c4] hover:border-[#a8825b]'
                }`}
            >
              All Pieces
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat.slug);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer ${activeCategory === cat.slug
                  ? 'bg-[#4e3828] text-white shadow-xs'
                  : 'bg-[#fcfbf7] text-[#554336] border border-[#d8d2c4] hover:border-[#a8825b]'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. DESKTOP HEADER (3-Column Haute Luxury Ivory Layout)
          ======================================================== */}
      <header className="hidden lg:block bg-[#f6f3eb]/95 backdrop-blur-md border-b border-[#e3ded3] sticky top-0 z-40 shadow-xs">
        <div className="grid grid-cols-3 max-w-[1450px] mx-auto px-8 xl:px-10 pt-5 pb-4 items-center">
          {/* Col 1: High-Legibility Luxury Search Pill */}
          <div className="col-span-1 justify-self-start w-80">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border border-[#d8d2c4] focus-within:border-[#a8825b] focus-within:ring-2 focus-within:ring-[#a8825b]/20 bg-[#fcfbf7] rounded-full px-4 py-2 transition-all shadow-2xs group"
            >
              <input
                type="text"
                placeholder="Search collection, linen, SKU..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                className="w-full text-sm text-[#3d2b1f] placeholder:text-[#878278] focus:outline-none bg-transparent font-body"
              />
              <button
                type="submit"
                className="text-[#a8825b] hover:text-[#3d2b1f] p-1 cursor-pointer transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Col 2: Centered Large & Razor Sharp Brand Crest */}
          <div className="col-span-1 justify-self-center text-center">
            <Link
              href="/"
              onClick={() => onSelectCategory && onSelectCategory('all')}
              className="inline-flex flex-col items-center group py-0.5"
            >
              <img
                src="/brand/logo.png"
                alt="Vincent & Vintage Logo"
                width={320}
                height={112}
                fetchPriority="high"
                decoding="async"
                className="h-24 lg:h-28 xl:h-32 w-auto max-w-[320px] xl:max-w-[360px] object-contain crisp-logo group-hover:scale-102 transition-transform duration-300 drop-shadow-xs"
              />
            </Link>
          </div>

          {/* Col 3: Clean Luxury Shopping Actions (Account, Wishlist, Bag) */}
          <div className="col-span-1 justify-self-end flex items-center gap-2.5 sm:gap-3 xl:gap-4">
            {/* 1. Client Account */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#d8d2c4] bg-[#fcfbf7] hover:bg-[#4e3828] hover:border-[#4e3828] text-[#3d2b1f] hover:text-white transition-all shadow-2xs text-xs font-display uppercase tracking-wider font-bold cursor-pointer group"
              title="Client Portal"
            >
              <User className="w-3.5 h-3.5 text-[#a8825b] group-hover:text-[#f4b66b]" />
              <span className="hidden xl:inline">{user ? user.name : 'Account'}</span>
            </button>

            {/* 2. Wishlist Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2.5 rounded-full border border-[#d8d2c4] bg-[#fcfbf7] hover:bg-[#4e3828] hover:border-[#4e3828] text-[#3d2b1f] hover:text-white transition-all shadow-2xs cursor-pointer group"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 text-[#a8825b] group-hover:text-[#f4b66b]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#a8825b] text-[10px] text-white rounded-full flex items-center justify-center font-bold shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* 3. Header Bag / Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#d8d2c4] bg-[#fcfbf7] hover:bg-[#4e3828] hover:border-[#4e3828] text-[#3d2b1f] hover:text-white transition-all shadow-2xs text-xs font-display uppercase tracking-wider font-bold cursor-pointer group"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#a8825b] group-hover:text-[#f4b66b]" />
              <span>Bag ({cartCount})</span>
            </button>
          </div>
        </div>

        {/* Subtle Matte Divider */}
        <div className="max-w-[1450px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-[#e3ded3] to-transparent" />

        {/* Horizontal Category Navigation Bar */}
        <nav className="max-w-[1450px] mx-auto px-6 py-3.5">
          <ul className="flex flex-wrap justify-center gap-5 xl:gap-9 uppercase text-sm xl:text-[15px] font-display tracking-widest font-semibold text-[#3d2b1f]">
            <li>
              <button
                onClick={() => onSelectCategory && onSelectCategory('all')}
                className={`hover:text-[#a8825b] transition-all pb-1 cursor-pointer ${activeCategory === 'all'
                  ? 'text-[#a8825b] border-b-2 border-[#a8825b] font-bold'
                  : ''
                  }`}
              >
                ALL COLLECTION
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id || cat.slug}>
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat.slug);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`hover:text-[#a8825b] transition-all pb-1 cursor-pointer ${activeCategory === cat.slug
                    ? 'text-[#a8825b] border-b-2 border-[#a8825b] font-bold'
                    : ''
                    }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ========================================================
          4. DESKTOP FLOATING RIGHT-EDGE SHOPPING BAG MEDALLION
          ======================================================== */}
      <div
        onClick={() => setCartDrawerOpen(true)}
        className="hidden lg:flex fixed right-0 top-[125px] -translate-y-1/2 font-display cursor-pointer z-40 group hover:-translate-x-2 transition-all duration-300 ease-out select-none"
        title="View Shopping Bag"
      >
        <div className="flex flex-col items-center bg-gradient-to-b from-[#4e3828] via-[#432f22] to-[#38251a] rounded-l-2xl py-3.5 px-3.5 shadow-[-6px_8px_25px_rgba(20,12,7,0.35)] group-hover:shadow-[-8px_12px_30px_rgba(20,12,7,0.45)] relative overflow-hidden min-w-[80px] transition-all">
          {/* Bag Icon & Badge */}
          <div className="relative mb-1">
            <ShoppingBag className="w-6 h-6 text-[#f4b66b] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-[#d4af37] to-[#f4b66b] text-[#24150d] text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </div>

          {/* Micro label */}
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#ede4db] group-hover:text-white transition-colors mt-0.5">
            {cartCount === 1 ? '1 Item' : `${cartCount} Items`}
          </span>

          {/* Luxury Amount Inset Pill with TK */}
          <div className="mt-2 bg-[#2c1b10] group-hover:bg-[#20130b] border border-white/10 rounded-lg px-2.5 py-1 flex items-center justify-center gap-1.5 transition-colors shadow-inner">
            <span className="text-[#f4b66b] text-[10px] font-bold font-display tracking-wider">TK</span>
            <span className="text-white text-xs font-bold font-display tracking-wider">
              {cartSubtotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. MOBILE NAVIGATION DRAWER
          ======================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#3d2e24]/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#fcfbf7] border-r border-[#eae7e1] h-full z-10 flex flex-col justify-between overflow-y-auto p-6 text-[#3d2b1f] shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-[#eae7e1] pb-4 mb-5">
                <img src="/brand/logo.png" alt="Vincent & Vintage" className="h-14 w-auto crisp-logo" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-[#3d2b1f] rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="mb-6">
                <div className="flex items-center border border-[#e3ded3] bg-[#ede8dc] rounded-xl px-3.5 py-2.5">
                  <input
                    type="text"
                    placeholder="Search shirts, polos, pants..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (onSearchChange) onSearchChange(e.target.value);
                    }}
                    className="w-full text-base text-[#3d2b1f] focus:outline-none bg-transparent"
                  />
                  <Search className="w-4 h-4 text-[#a8825b]" />
                </div>
              </form>

              <p className="text-xs font-bold uppercase tracking-widest text-[#a8825b] mb-3">
                Collections
              </p>
              <ul className="space-y-3 font-display text-base uppercase tracking-wider text-[#3d2b1f]">
                <li>
                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('all');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-1 hover:text-[#a8825b] font-medium"
                  >
                    All Collections
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <button
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.slug);
                        setMobileMenuOpen(false);
                        const el = document.getElementById('catalog-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left py-1 hover:text-[#a8825b] font-medium"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Support Actions */}
            <div className="border-t border-[#e3ded3] pt-5 space-y-2.5 text-sm">
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#ede8dc] text-[#3d2b1f] font-semibold uppercase tracking-wider text-center"
              >
                <PackageSearch className="w-4 h-4 text-[#a8825b]" />
                <span>Track My Order</span>
              </Link>

              <a
                href="tel:01700000000"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4e3828] text-white font-bold uppercase tracking-wider text-center shadow-xs"
              >
                <Phone className="w-4 h-4 text-[#f4b66b]" />
                <span>Customer Care Hotline</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. MOBILE BOTTOM STICKY NAVIGATION BAR (App-Style)
          ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#fcfbf7]/95 backdrop-blur-md border-t border-[#e3ded3] z-40 lg:hidden shadow-[0_-4px_20px_rgba(30,20,10,0.08)] pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-2 px-3">
        <div className="flex justify-around items-center">
          <Link
            href="/"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 text-[#3d2b1f] min-w-[50px] py-1 cursor-pointer"
          >
            <Home className="w-5 h-5 text-[#a8825b]" />
            <span className="text-[11px] font-display uppercase tracking-wider font-semibold text-[#59544c]">
              Home
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[#3d2b1f] min-w-[50px] py-1 cursor-pointer"
          >
            <LayoutGrid className="w-5 h-5 text-[#59544c]" />
            <span className="text-[11px] font-display uppercase tracking-wider font-semibold text-[#59544c]">
              Catalog
            </span>
          </button>

          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex flex-col items-center gap-0.5 text-[#3d2b1f] min-w-[50px] py-1 cursor-pointer"
          >
            <Search className={`w-5 h-5 ${mobileSearchOpen ? 'text-[#a8825b]' : 'text-[#59544c]'}`} />
            <span className="text-[11px] font-display uppercase tracking-wider font-semibold text-[#59544c]">
              Search
            </span>
          </button>

          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[#3d2b1f] relative min-w-[50px] py-1 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#59544c]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#a8825b] text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-1">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-display uppercase tracking-wider font-semibold text-[#59544c]">
              Bag
            </span>
          </button>

          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[#3d2b1f] relative min-w-[50px] py-1 cursor-pointer"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-[#59544c]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#a8825b] text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-1">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-display uppercase tracking-wider font-semibold text-[#59544c]">
              Saved
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
