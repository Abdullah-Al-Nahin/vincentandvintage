'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
  PackageOpen
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import SectionHeader from '@/components/SectionHeader';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_HERO_SLIDES } from '@/lib/initialData';

export default function HomePage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [heroSlides, setHeroSlides] = useState(INITIAL_HERO_SLIDES);
  const [promoBlocks, setPromoBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    fetch('/api/products', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Storefront API response not ok');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) setProducts(data.products);
        if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
        if (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) setHeroSlides(data.heroSlides);
        if (Array.isArray(data.promoBlocks) && data.promoBlocks.length > 0) setPromoBlocks(data.promoBlocks);
      })
      .catch((err) => {
        // Silently preserve initial snapshot if offline or timeout
        console.warn('Storefront using fast local snapshot:', err.message);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Autoplay Hero Slider if slides exist
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNewArrival);

  // Bento Layout Blocks
  const bentoLarge = promoBlocks.find((b) => b.blockType === 'bento_large');
  const bentoSmalls = promoBlocks.filter((b) => b.blockType === 'bento_small');

  // Split Category Showcases
  const splitShowcases = promoBlocks.filter((b) => b.blockType === 'split_showcase');

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.categorySlug === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const scrollToCatalog = (categorySlug = 'all') => {
    setActiveCategory(categorySlug);
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3eb] text-[#3d2b1f]">
      <Navbar
        categories={categories}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <main className="flex-1">
        {/* ========================================================
            1. DYNAMIC HERO BANNER SLIDER
            ======================================================== */}
        <section className="relative w-full overflow-hidden bg-[#4e3828]">
          {heroSlides.length > 0 ? (
            <div className="relative h-[320px] sm:h-[460px] lg:h-[590px] w-full">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3d2e24]/90 via-[#4e3828]/60 to-transparent flex items-center">
                    <div className="max-w-[1450px] mx-auto px-6 sm:px-14 w-full">
                      <div className="max-w-2xl text-white space-y-4">
                        {slide.badge && (
                          <span className="inline-block bg-[#a8825b] text-white text-xs sm:text-sm font-display uppercase tracking-widest px-4 py-1.5 rounded-md font-bold shadow-xs">
                            {slide.badge}
                          </span>
                        )}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-wide leading-tight drop-shadow-md">
                          {slide.title}
                        </h1>
                        {slide.subtitle && (
                          <p className="text-sm sm:text-base lg:text-lg text-[#f9af5e] font-display tracking-widest uppercase font-semibold">
                            {slide.subtitle}
                          </p>
                        )}
                        <div className="pt-3 flex flex-wrap gap-4">
                          <button
                            onClick={() => scrollToCatalog('all')}
                            className="bg-gradient-to-r from-[#977b63] to-[#c0a086] hover:from-[#3e2b1f] hover:to-[#3e2b1f] text-white px-7 py-3.5 rounded-lg font-display uppercase tracking-widest text-xs sm:text-sm font-bold shadow-xl transition-all cursor-pointer"
                          >
                            {slide.ctaText || 'EXPLORE COLLECTION'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Slider Navigation Arrows (only if > 1 slide) */}
              {heroSlides.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentSlide(
                        (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
                      )
                    }
                    className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-[#3d2b1f] p-2.5 rounded-full shadow-lg cursor-pointer transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
                    }
                    className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-[#3d2b1f] p-2.5 rounded-full shadow-lg cursor-pointer transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Slider Dots */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                    {heroSlides.map((s, idx) => (
                      <button
                        key={s.id || idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2.5 rounded-full transition-all ${
                          idx === currentSlide ? 'w-10 bg-[#b89579]' : 'w-2.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Fallback Clean Brand Banner when no slides configured */
            <div className="relative h-[340px] sm:h-[480px] w-full flex items-center justify-center bg-gradient-to-r from-[#977b63] via-[#b89579] to-[#977b63] text-white px-6">
              <div className="max-w-2xl text-center space-y-5">
                <img
                  src="/brand/logo.png"
                  alt="Vincent & Vintage"
                  className="h-20 sm:h-24 mx-auto object-contain crisp-logo invert brightness-200"
                />
                <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-wider text-white">
                  VINCENT &amp; VINTAGE
                </h1>
                <p className="text-[#f9af5e] text-sm sm:text-base font-display uppercase tracking-widest font-semibold">
                  Feel The Style • Premium Quality || Comfort || Classy
                </p>
                <div className="pt-2 flex justify-center gap-4">
                  <button
                    onClick={() => scrollToCatalog('all')}
                    className="bg-[#a8825b] hover:bg-[#8e6d4a] text-white px-6 py-3 rounded-lg text-xs sm:text-sm font-display uppercase tracking-widest font-bold shadow-md cursor-pointer transition-all"
                  >
                    Explore Catalog
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================
            2. ATELIER ASSURANCE & TRUST STRIP (Unified Seamless Bar)
            ======================================================== */}
        <section className="max-w-[1450px] mx-auto px-4 sm:px-8 mt-5 mb-6 lg:mt-6 lg:mb-8">
          <div className="bg-[#fcfbf7] border border-[#e3ded3] rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e3ded3]">
            {[
              {
                icon: Truck,
                title: 'Fastest Shipping',
                sub: '24-48h Delivery Nationwide'
              },
              {
                icon: ShieldCheck,
                title: 'Cash on Delivery',
                sub: 'Inspect & Pay Upon Delivery'
              },
              {
                icon: Award,
                title: 'Handcrafted Quality',
                sub: 'Export-Grade Atelier Textiles'
              },
              {
                icon: Sparkles,
                title: 'Authentic Heritage',
                sub: '100% Genuine Atelier Tailoring'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 px-5 py-4 lg:py-5 hover:bg-[#ede8dc]/40 transition-colors group cursor-default"
                >
                  <div className="w-11 h-11 rounded-full bg-[#ede8dc] border border-[#d8d2c4] text-[#a8825b] group-hover:bg-[#4e3828] group-hover:text-white group-hover:border-[#4e3828] flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-xs sm:text-[13px] uppercase tracking-wider text-[#3d2b1f] group-hover:text-[#4e3828] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#6e5d52] mt-0.5 leading-snug line-clamp-1">
                      {item.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            3. DYNAMIC BROWSE OUR CATEGORIES (Rendered from DB)
            ======================================================== */}
        {categories.length > 0 && (
          <>
            <SectionHeader
              title="browse our categories"
              actionText="All Categories"
              onAction={() => scrollToCatalog('all')}
            />
            <section className="max-w-[1450px] mx-auto px-4 sm:px-8 mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id || cat.slug}
                    onClick={() => scrollToCatalog(cat.slug)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-[#e3ded3] shadow-xs hover:shadow-xl hover:border-[#a8825b]/50 transition-all duration-300"
                  >
                    <img
                      src={cat.cardImage}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a1c14]/70 via-transparent to-transparent" />
                    <p className="absolute bottom-3.5 left-1/2 -translate-x-1/2 bg-[#fcfbf7]/95 border border-[#e3ded3] uppercase text-[#3d2b1f] rounded-xl px-5 sm:px-6 py-2 text-xs sm:text-sm font-display tracking-widest group-hover:bg-[#4e3828] group-hover:text-white group-hover:border-[#4e3828] transition-all w-max shadow-md font-bold">
                      {cat.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ========================================================
            4. BEST SELLING PRODUCTS (Dynamic Filter)
            ======================================================== */}
        {bestSellers.length > 0 && (
          <>
            <SectionHeader
              title="Best Selling Products"
              actionText="View All"
              onAction={() => scrollToCatalog('all')}
            />
            <section className="max-w-[1450px] mx-auto px-4 sm:px-8 mb-14">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {bestSellers.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ========================================================
            5. DYNAMIC ASYMMETRIC BENTO PROMO GRID (From promo_blocks DB)
            ======================================================== */}
        {(bentoLarge || bentoSmalls.length > 0) && (
          <section className="max-w-[1450px] mx-auto px-4 sm:px-8 my-12">
            <div className="grid grid-cols-12 gap-5">
              {/* Left 8 Cols: Large Feature Banner */}
              {bentoLarge && (
                <div
                  onClick={() => scrollToCatalog(bentoLarge.categorySlug || 'all')}
                  className={`col-span-12 ${
                    bentoSmalls.length > 0 ? 'md:col-span-8' : 'md:col-span-12'
                  } relative rounded-2xl overflow-hidden h-[300px] sm:h-[460px] cursor-pointer group border border-[#e3ded3] shadow-md`}
                >
                  <img
                    src={bentoLarge.imageUrl}
                    alt={bentoLarge.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a1c14]/90 via-[#4e3828]/45 to-transparent flex flex-col justify-end p-7 sm:p-10">
                    {bentoLarge.badge && (
                      <span className="text-[#f9af5e] text-xs sm:text-sm font-display uppercase tracking-widest font-bold">
                        {bentoLarge.badge}
                      </span>
                    )}
                    <h3 className="text-white text-3xl sm:text-4xl font-display font-bold uppercase tracking-wider mt-1.5 drop-shadow">
                      {bentoLarge.title}
                    </h3>
                    {bentoLarge.subtitle && (
                      <p className="text-gray-200 text-xs sm:text-base mt-2 max-w-xl">
                        {bentoLarge.subtitle}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-display uppercase tracking-widest bg-[#b89579] text-white px-5 py-2.5 rounded-lg w-max font-bold shadow-md hover:bg-[#a8825b]">
                      Explore Series <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* Right 4 Cols: Stacked Small Banners */}
              {bentoSmalls.length > 0 && (
                <div
                  className={`col-span-12 ${
                    bentoLarge ? 'md:col-span-4' : 'md:col-span-12'
                  } flex flex-col gap-5`}
                >
                  {bentoSmalls.slice(0, 2).map((block) => (
                    <div
                      key={block.id}
                      onClick={() => scrollToCatalog(block.categorySlug || 'all')}
                      className="relative rounded-2xl overflow-hidden h-[218px] flex-1 cursor-pointer group border border-[#e3ded3] shadow-md"
                    >
                      <img
                        src={block.imageUrl}
                        alt={block.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2a1c14]/85 via-[#4e3828]/35 to-transparent flex flex-col justify-end p-6">
                        {block.badge && (
                          <span className="text-[#f9af5e] text-xs font-display uppercase tracking-widest font-bold">
                            {block.badge}
                          </span>
                        )}
                        <h4 className="text-white text-xl sm:text-2xl font-display font-bold uppercase">
                          {block.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========================================================
            6. NEW ARRIVAL PRODUCTS (Dynamic Filter)
            ======================================================== */}
        {newArrivals.length > 0 && (
          <>
            <SectionHeader
              title="New Arrival Products"
              actionText="See All"
              onAction={() => scrollToCatalog('all')}
            />
            <section className="max-w-[1450px] mx-auto px-4 sm:px-8 mb-14">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {newArrivals.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ========================================================
            7. DYNAMIC SPLIT-BANNER SHOWCASE (From promo_blocks DB)
            ======================================================== */}
        {splitShowcases.length > 0 && (
          <section className="max-w-[1450px] mx-auto px-4 sm:px-8 my-14 space-y-12">
            {splitShowcases.map((block, idx) => {
              const showcaseProducts = products
                .filter((p) => p.categorySlug === block.categorySlug)
                .slice(0, 3);
              const isReversed = idx % 2 === 1;

              return (
                <div
                  key={block.id || idx}
                  className={`flex flex-col ${
                    isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
                  } bg-[#ede8dc] border border-[#e3ded3] rounded-2xl overflow-hidden shadow-xs`}
                >
                  <div
                    onClick={() => scrollToCatalog(block.categorySlug || 'all')}
                    className="md:w-[28%] relative min-h-[280px] cursor-pointer group overflow-hidden"
                  >
                    <img
                      src={block.imageUrl}
                      alt={block.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a1c14]/85 via-[#4e3828]/35 to-transparent flex flex-col justify-end p-7 text-white">
                      {block.badge && (
                        <span className="text-xs font-display uppercase tracking-widest text-[#f9af5e] font-bold">
                          {block.badge}
                        </span>
                      )}
                      <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase mt-1">
                        {block.title}
                      </h3>
                      <span className="mt-2 inline-block text-xs uppercase tracking-widest underline text-[#b89579]">
                        Explore Category &rarr;
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-5 sm:p-8">
                    {showcaseProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {showcaseProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#e3ded3] rounded-xl text-[#6e5d52]">
                        <PackageOpen className="w-10 h-10 text-[#a8825b] mb-2" />
                        <p className="text-sm font-display uppercase tracking-wider font-semibold">
                          No garments added to this category yet.
                        </p>
                        <p className="text-xs text-[#878278] mt-1">
                          Publish SKUs in the Admin Dashboard to populate this showcase.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ========================================================
            8. COMPLETE COLLECTION CATALOG (Dynamic Tabs & Filtering)
            ======================================================== */}
        <div id="catalog-section" className="scroll-mt-28">
          <SectionHeader title="Complete Collection Catalog" />
          <section className="max-w-[1450px] mx-auto px-4 sm:px-8 mb-20">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-display uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#4e3828] text-white font-bold shadow-sm'
                    : 'bg-[#fcfbf7] border border-[#e3ded3] text-[#6e5d52] hover:border-[#b89579] hover:text-[#3d2b1f]'
                }`}
              >
                All ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-display uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat.slug
                      ? 'bg-[#4e3828] text-white font-bold shadow-sm'
                      : 'bg-[#fcfbf7] border border-[#e3ded3] text-[#6e5d52] hover:border-[#b89579] hover:text-[#3d2b1f]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {searchQuery && (
              <div className="mb-6 text-center text-base text-[#6e5d52]">
                Showing results for <strong className="text-[#3d2b1f]">&quot;{searchQuery}&quot;</strong> (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#a8825b] underline ml-1 cursor-pointer font-semibold"
                >
                  Clear search
                </button>
                )
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#fcfbf7] border border-[#e3ded3] rounded-2xl p-8 max-w-xl mx-auto shadow-xs">
                <PackageOpen className="w-12 h-12 text-[#a8825b] mx-auto mb-3" />
                <h3 className="text-lg font-display font-bold uppercase tracking-wider text-[#3d2b1f]">
                  No Garments Available
                </h3>
                <p className="text-sm text-[#6e5d52] mt-1.5">
                  {categories.length === 0
                    ? 'No collections or products have been published yet. Go to Admin to add your categories and products.'
                    : 'No items match your active filter or search query.'}
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  {activeCategory !== 'all' && (
                    <button
                      onClick={() => setActiveCategory('all')}
                      className="px-4 py-2 bg-[#4e3828] text-white rounded-lg text-xs font-display uppercase tracking-wider hover:bg-[#3e2b1f]"
                    >
                      View All Products
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
