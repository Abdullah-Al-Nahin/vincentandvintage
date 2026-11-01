'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Minus,
  Plus,
  ArrowLeft,
  Share2,
  Check,
  Ruler,
  PhoneCall,
  Clock,
  Sparkles,
  Maximize2,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const {
    addToCart,
    toggleWishlist,
    wishlist,
    setCheckoutModalOpen,
    showToast
  } = useStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Gallery & Image Viewer State
  const [activeImage, setActiveImage] = useState('');
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // Variant Selection State (Product -> Colour -> Size)
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);

  // Accordion Toggles
  const [openAccordion, setOpenAccordion] = useState('specs'); // 'specs', 'care', 'delivery'
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);

    // Fetch single product by slug and store catalog for related pieces
    Promise.all([
      fetch(`/api/products?slug=${encodeURIComponent(slug)}`),
      fetch('/api/products')
    ])
      .then(async ([prodRes, allRes]) => {
        const prodData = await prodRes.json();
        const allData = await allRes.json();

        if (prodRes.ok && prodData.product) {
          const p = prodData.product;
          setProduct(p);
          setActiveImage(p.primaryImage);

          // Configure initial color
          const colors = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [];
          const initialColor = colors[0]?.name || 'Standard';
          setSelectedColor(initialColor);

          // Configure initial size based on the chosen color
          const isSingleProd = p.inventoryType === 'single' || !p.sizes || p.sizes.length === 0;
          if (isSingleProd) {
            setSelectedSize('ONE_SIZE');
          } else {
            const colorObj = colors.find((c) => c.name === initialColor) || colors[0];
            const colorSizes = colorObj?.sizes && colorObj.sizes.length > 0 ? colorObj.sizes : p.sizes;
            const inStockSize = colorSizes?.find((s) => Number(s.stock) > 0)?.size || colorSizes?.[0]?.size || 'M';
            setSelectedSize(inStockSize);
          }

          // Related products (same category or others, excluding current)
          const others = (allData.products || []).filter((item) => item.id !== p.id);
          const sameCat = others.filter((item) => item.categorySlug === p.categorySlug);
          setRelatedProducts(sameCat.length > 0 ? sameCat.slice(0, 4) : others.slice(0, 4));
        } else {
          setNotFound(true);
        }

        if (allData.categories) setCategories(allData.categories);
      })
      .catch((err) => {
        console.error('Error fetching product detail:', err);
        setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Handle switching color: recalculate available sizes for this specific shade
  const handleSelectColor = (colorName) => {
    setSelectedColor(colorName);
    if (!product) return;
    const isSingleProd = product.inventoryType === 'single' || !product.sizes || product.sizes.length === 0;
    if (isSingleProd) {
      setSelectedSize('ONE_SIZE');
      return;
    }

    const targetColorObj = product.colors?.find((c) => c.name === colorName);
    const colorSizes = targetColorObj?.sizes && targetColorObj.sizes.length > 0 ? targetColorObj.sizes : product.sizes;
    const currentSizeAvailable = colorSizes?.find((s) => s.size === selectedSize && Number(s.stock) > 0);

    if (!currentSizeAvailable) {
      const nextAvailable = colorSizes?.find((s) => Number(s.stock) > 0)?.size || colorSizes?.[0]?.size || 'M';
      setSelectedSize(nextAvailable);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.name,
          text: `Check out ${product?.name} at Vincent & Vintage`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Product link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f6f3eb] text-[#3d2b1f]">
        <Navbar categories={categories} />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-3 border-[#a8825b] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-display uppercase tracking-widest text-sm text-[#6e5d52]">
            Loading Atelier Piece . . .
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f6f3eb] text-[#3d2b1f]">
        <Navbar categories={categories} />
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-20 text-center">
          <span className="text-xs uppercase font-display tracking-widest text-[#a8825b] font-bold block mb-2">
            Vincent &amp; Vintage Atelier
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-wider text-[#3d2b1f] mb-4">
            Piece Not Found
          </h1>
          <p className="text-sm sm:text-base text-[#6e5d52] mb-8 max-w-md mx-auto">
            This garment or accessory SKU may have been archived or is no longer listed in our current catalog.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#4e3828] text-white hover:bg-[#3e2b1f] px-7 py-3.5 rounded-xl font-display uppercase tracking-widest text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Stock and variant computations
  const isSingle = product.inventoryType === 'single' || !product.sizes || product.sizes.length === 0;
  const totalStock = Number(product.totalStock !== undefined ? product.totalStock : 0);
  const threshold = Number(product.lowStockThreshold) || 5;
  const isSoldOut = product.isSoldOut || totalStock <= 0;
  const isLowStock = !isSoldOut && (product.isLowStock || totalStock <= threshold);

  // Active color object
  const currentColorObj =
    product.colors?.find((c) => c.name === selectedColor) || product.colors?.[0];
  const availableSizesForColor =
    currentColorObj?.sizes && currentColorObj.sizes.length > 0
      ? currentColorObj.sizes
      : product.sizes || [];

  // Active size stock
  const currentSizeObj = isSingle
    ? null
    : availableSizesForColor.find((s) => s.size === selectedSize);
  const currentVariantStock = isSingle
    ? Number(currentColorObj?.stock !== undefined ? currentColorObj.stock : totalStock)
    : Number(currentSizeObj?.stock || 0);
  const isCurrentSelectionDepleted = isSoldOut || currentVariantStock <= 0;
  const maxAvailableQty = Math.max(0, currentVariantStock);

  // Gallery angles
  const galleryImages = [
    product.primaryImage,
    product.hoverImage,
    ...(product.gallery || [])
  ].filter(Boolean);
  const uniqueGallery = Array.from(new Set(galleryImages));

  // Category classification (apparel vs accessory)
  const isApparelCategory =
    !product.categorySlug ||
    (!['accessories', 'leather-goods', 'bags', 'wallets', 'belts', 'footwear', 'shoes'].some((slug) =>
      product.categorySlug.toLowerCase().includes(slug)
    ) &&
    !product.category?.toLowerCase().includes('accessories') &&
    !product.category?.toLowerCase().includes('leather') &&
    !product.category?.toLowerCase().includes('bag') &&
    !product.category?.toLowerCase().includes('wallet') &&
    !product.category?.toLowerCase().includes('belt'));

  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const discountPercent =
    product.regularPrice > product.salePrice
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : 0;

  // Direct 1-Click Cash on Delivery Checkout Action
  const handleOrderNowCod = () => {
    if (isCurrentSelectionDepleted) return;
    addToCart(product, isSingle ? 'ONE_SIZE' : selectedSize, selectedColor, qty, false);
    setCheckoutModalOpen(true);
  };

  // Standard Add to Bag Action
  const handleAddToBag = () => {
    if (isCurrentSelectionDepleted) return;
    addToCart(product, isSingle ? 'ONE_SIZE' : selectedSize, selectedColor, qty, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3eb] text-[#3d2b1f]">
      <Navbar categories={categories} />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#e3ded3] bg-[#fcfbf7]/60">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between text-xs font-display uppercase tracking-widest text-[#6e5d52]">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#a8825b] transition-colors">
              Atelier Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/#catalog-section" className="hover:text-[#a8825b] transition-colors">
              Collection
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#a8825b] font-bold">{product.category}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] bg-[#ede8dc] px-2.5 py-0.5 rounded text-[#3d2b1f]">
              SKU: {product.sku}
            </span>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 hover:text-[#3d2b1f] transition-colors cursor-pointer"
              title="Share piece"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1450px] w-full mx-auto px-4 sm:px-8 py-8 lg:py-12 pb-28 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* ========================================================
              LEFT COLUMN: MULTI-ANGLE ATELIER GALLERY
              ======================================================== */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 sm:gap-5 sticky lg:top-28">
            {/* Thumbnail Strip */}
            {uniqueGallery.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] shrink-0 pb-2 md:pb-0">
                {uniqueGallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#ede8dc] shrink-0 ${
                      activeImage === imgUrl
                        ? 'border-[#4e3828] ring-2 ring-[#c59f72]/40 shadow-md'
                        : 'border-[#e3ded3] hover:border-[#a8825b] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} angle ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image Frame */}
            <div className="relative flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-[#ede8dc] border border-[#e3ded3] shadow-md group">
              <img
                src={activeImage || product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Fullscreen Zoom Trigger */}
              <button
                onClick={() => setZoomModalOpen(true)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#fcfbf7]/90 text-[#3d2b1f] hover:bg-[#4e3828] hover:text-white transition-all shadow-md cursor-pointer border border-[#e3ded3]"
                title="Fullscreen Image View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                {discountPercent > 0 && !isSoldOut && (
                  <span className="bg-[#4e3828] text-white text-xs font-display font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-[#a8825b] text-white text-[11px] font-display font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow">
                    Best Seller
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="bg-[#4e3828] text-white text-[11px] font-display font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow">
                    New Season
                  </span>
                )}
              </div>

              {/* Sold Out Full Frame Lock */}
              {isSoldOut && (
                <div className="absolute inset-0 bg-[#1a100b]/55 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                  <div className="bg-[#4e3828] border border-[#c59f72] text-white px-6 py-3 rounded-xl text-center shadow-2xl">
                    <span className="text-sm sm:text-base font-display uppercase tracking-[0.2em] font-bold block">
                      ARCHIVED PIECE &bull; SOLD OUT
                    </span>
                    <span className="text-xs text-[#dcd7cb] font-body mt-1 block">
                      Production fully committed for this season
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: EDITORIAL BESPOKE PRODUCT DETAILS
              ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header: Category, Title, Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-display tracking-[0.2em] font-bold text-[#a8825b] bg-[#ede8dc] px-3 py-1 rounded-md">
                  {product.category}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-[#3d2b1f] font-semibold">
                  <div className="flex items-center text-[#fbca51]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span>{product.rating || '4.9'}</span>
                  <span className="text-gray-400 font-normal">
                    ({product.reviewsCount || 48} Atelier Reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-display font-bold uppercase tracking-wide text-[#3d2b1f] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-[#fcfbf7] border border-[#e3ded3] shadow-xs flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#3d2b1f] tracking-wider">
                  TK. {Number(product.salePrice).toLocaleString()}
                </span>
                {product.regularPrice > product.salePrice && (
                  <span className="text-sm sm:text-base line-through text-[#878278] font-display">
                    TK. {Number(product.regularPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {discountPercent > 0 && (
                <span className="text-xs font-display uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                  Save TK. {Number(product.regularPrice - product.salePrice).toLocaleString()}
                </span>
              )}
            </div>

            {/* Dynamic Stock Ledger Notice */}
            {isSoldOut ? (
              <div className="bg-[#4e3828] text-white border border-[#c59f72]/50 p-4 rounded-2xl text-xs sm:text-sm font-display flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-[#f4b66b] mt-0.5" />
                <div>
                  <strong className="tracking-wider uppercase block">Sold Out Workshop Release</strong>
                  <p className="text-[#ede8dc] text-xs font-normal mt-0.5">
                    This piece has completed its seasonal tailor run. Sizing and ordering are locked until the next workshop drop.
                  </p>
                </div>
              </div>
            ) : isLowStock ? (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-2xl text-xs sm:text-sm font-display flex items-center gap-3 animate-pulse">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700" />
                <div>
                  <strong className="tracking-wider uppercase">Limited Atelier Production:</strong>
                  <span className="ml-1 text-xs font-semibold">
                    Only <strong>{totalStock} units</strong> remaining in central vault across all variants.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Atelier On-Hand:</strong> In stock and ready for immediate courier dispatch across Bangladesh.
                </span>
              </div>
            )}

            {/* Dynamic Category-Aware Material & Specifications */}
            {product.fabric && (
              <div className="p-4 rounded-2xl bg-[#ede8dc]/70 border border-[#e3ded3]">
                <span className="text-xs uppercase font-display tracking-wider font-bold text-[#a8825b] block mb-1">
                  {isApparelCategory
                    ? 'Fabric & Weave Specification'
                    : 'Material & Craftsmanship Specification'}
                </span>
                <p className="text-sm text-[#3d2b1f] font-medium leading-relaxed">
                  {product.fabric}
                </p>
              </div>
            )}

            {/* Editorial Description */}
            <p className="text-sm sm:text-base text-[#6e5d52] leading-relaxed">
              {product.description}
            </p>

            {/* ========================================================
                HIERARCHICAL SELECTION: 1. COLOUR -> 2. SIZE (M/L/XL)
                ======================================================== */}
            <div className="p-5 rounded-2xl bg-[#fcfbf7] border border-[#e3ded3] space-y-5 shadow-xs">
              {/* STEP 1: Select Colour */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs uppercase font-display tracking-widest font-bold text-[#3d2b1f]">
                      1. Select Colour: <strong className="text-[#a8825b]">{selectedColor}</strong>
                    </span>
                    {currentColorObj && (
                      <span className="text-xs text-[#6e5d52] font-mono">
                        {Number(currentColorObj.stock) <= 0
                          ? 'Depleted in this shade'
                          : `${currentColorObj.stock} units available`}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => {
                      const cStock = Number(c.stock !== undefined ? c.stock : 0);
                      const isColorOut = cStock <= 0;
                      const isSelected = selectedColor === c.name;

                      return (
                        <button
                          key={c.name}
                          disabled={isColorOut}
                          onClick={() => handleSelectColor(c.name)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#4e3828] bg-[#4e3828] text-white ring-2 ring-[#c59f72]/40 shadow-xs'
                              : isColorOut
                              ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed opacity-50'
                              : 'border-[#e3ded3] bg-[#ede8dc] text-[#3d2b1f] hover:border-[#a8825b]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-[#4e3828]/30 shrink-0 shadow-2xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="font-display tracking-wider">{c.name}</span>
                          {isColorOut ? (
                            <span className="text-[10px] text-red-500 font-bold">(Sold Out)</span>
                          ) : (
                            <span className="text-[10px] opacity-75 font-mono">({cStock})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Select Size for the chosen Colour */}
              {isSingle ? (
                /* Universal Spec for Accessories / Leather Goods */
                <div className="p-3.5 rounded-xl bg-[#ede8dc]/80 border border-[#e3ded3]">
                  <div className="flex items-center justify-between text-xs font-display uppercase tracking-wider font-semibold text-[#3d2b1f]">
                    <span>Fit: Universal / One Size Spec</span>
                    <span
                      className={
                        isSoldOut || currentVariantStock <= 0
                          ? 'text-red-700 font-bold'
                          : currentVariantStock <= threshold
                          ? 'text-amber-800 font-bold'
                          : 'text-emerald-800 font-medium'
                      }
                    >
                      {currentVariantStock <= 0
                        ? 'Sold Out in this shade'
                        : `${currentVariantStock} units ready in atelier`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e5d52] mt-1">
                    Standard luxury accessory dimensions. No garment sizing required.
                  </p>
                </div>
              ) : (
                /* Sized Apparel Hierarchy (M, L, XL, XXL) */
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs uppercase font-display tracking-widest font-bold text-[#3d2b1f]">
                      2. Select Size ({selectedColor}):{' '}
                      <strong className="text-[#a8825b]">{selectedSize}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
                      className="text-xs text-[#a8825b] hover:text-[#3d2b1f] inline-flex items-center gap-1 font-display uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{sizeGuideOpen ? 'Hide Size Chart' : 'Atelier Size Guide'}</span>
                    </button>
                  </div>

                  {/* Size Guide Measurement Table Drawer */}
                  {sizeGuideOpen && (
                    <div className="mb-3.5 p-3.5 rounded-xl bg-[#ede8dc] border border-[#e3ded3] text-xs animate-fade-in">
                      <span className="font-display font-bold uppercase tracking-wider text-[#3d2b1f] block mb-2">
                        Atelier Sizing Guide (Inches):
                      </span>
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className="border-b border-[#d8d2c4] font-display uppercase text-[#6e5d52]">
                            <th className="py-1">Size</th>
                            <th className="py-1">Chest</th>
                            <th className="py-1">Length</th>
                            <th className="py-1">Fit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d8d2c4]/50 font-mono">
                          <tr>
                            <td className="py-1 font-bold">M</td>
                            <td>40&quot;</td>
                            <td>28&quot;</td>
                            <td>Regular Comfort</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-bold">L</td>
                            <td>42&quot;</td>
                            <td>29&quot;</td>
                            <td>Tailored Fit</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-bold">XL</td>
                            <td>44&quot;</td>
                            <td>30&quot;</td>
                            <td>Relaxed Silhouette</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-bold">XXL</td>
                            <td>46&quot;</td>
                            <td>31&quot;</td>
                            <td>Draped Comfort</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Size Pills for Active Color */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {availableSizesForColor.map((s) => {
                      const stock = Number(s.stock) || 0;
                      const isOutOfStock = stock <= 0;
                      const isSelected = selectedSize === s.size;

                      return (
                        <button
                          key={s.size}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(s.size)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#4e3828] bg-[#4e3828] text-white ring-2 ring-[#c59f72]/40 shadow-xs'
                              : isOutOfStock
                              ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed opacity-50'
                              : 'border-[#e3ded3] bg-[#ede8dc] text-[#3d2b1f] hover:border-[#a8825b]'
                          }`}
                        >
                          <span className="font-display font-bold text-sm block tracking-wider">
                            {s.size}
                          </span>
                          <span className="text-[10px] block opacity-75 font-mono mt-0.5">
                            {isOutOfStock ? 'Sold Out' : `${stock} left`}
                          </span>
                          {s.chest && s.length && (
                            <span className="text-[9px] block text-gray-500 mt-0.5">
                              {s.chest}&quot; &times; {s.length}&quot;
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Action Buttons */}
              <div className="pt-2 border-t border-[#e3ded3] space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f]">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-[#e3ded3] rounded-xl bg-[#ede8dc] overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1 || isCurrentSelectionDepleted}
                      className="px-3 py-1.5 text-[#3d2b1f] hover:bg-[#4e3828]/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1.5 text-xs font-mono font-bold text-[#3d2b1f]">
                      {qty}
                    </span>
                    <button
                      onClick={() => {
                        if (maxAvailableQty > 0 && qty >= maxAvailableQty) {
                          showToast(`Maximum on-hand stock is ${maxAvailableQty} units.`);
                          return;
                        }
                        setQty(qty + 1);
                      }}
                      disabled={isCurrentSelectionDepleted || (maxAvailableQty > 0 && qty >= maxAvailableQty)}
                      className="px-3 py-1.5 text-[#3d2b1f] hover:bg-[#4e3828]/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`ml-auto p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'bg-[#a8825b] text-white border-[#a8825b]'
                        : 'bg-[#ede8dc] text-[#3d2b1f] border-[#e3ded3] hover:border-[#a8825b]'
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Primary Dual Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    disabled={isCurrentSelectionDepleted}
                    onClick={handleAddToBag}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-display uppercase tracking-widest text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                      isCurrentSelectionDepleted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#4e3828] text-white hover:bg-[#3e2b1f] cursor-pointer'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {isSoldOut ? 'Sold Out' : isCurrentSelectionDepleted ? 'Variant Depleted' : 'Add To Bag'}
                    </span>
                  </button>

                  <button
                    disabled={isCurrentSelectionDepleted}
                    onClick={handleOrderNowCod}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-display uppercase tracking-widest text-xs font-bold transition-all shadow-md text-center ${
                      isCurrentSelectionDepleted
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#977b63] via-[#b89579] to-[#977b63] hover:from-[#3e2b1f] hover:to-[#3e2b1f] text-white cursor-pointer'
                    }`}
                  >
                    {isSoldOut ? 'Currently Unavailable' : 'Order Now — Cash on Delivery'}
                  </button>
                </div>
              </div>
            </div>

            {/* Atelier Guarantees & Features */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#fcfbf7] border border-[#e3ded3] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#a8825b] shrink-0" />
                <div>
                  <span className="font-display font-bold text-xs uppercase tracking-wider block text-[#3d2b1f]">
                    Cash on Delivery
                  </span>
                  <span className="text-[11px] text-[#6e5d52]">Bangladesh-wide delivery</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fcfbf7] border border-[#e3ded3] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#a8825b] shrink-0" />
                <div>
                  <span className="font-display font-bold text-xs uppercase tracking-wider block text-[#3d2b1f]">
                    Fast Nationwide Shipping
                  </span>
                  <span className="text-[11px] text-[#6e5d52]">24-48h Express Delivery</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fcfbf7] border border-[#e3ded3] flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#a8825b] shrink-0" />
                <div>
                  <span className="font-display font-bold text-xs uppercase tracking-wider block text-[#3d2b1f]">
                    Old Money Craft
                  </span>
                  <span className="text-[11px] text-[#6e5d52]">Export-Grade Tailoring</span>
                </div>
              </div>
            </div>

            {/* Editorial Accordion Blocks */}
            <div className="space-y-2.5 pt-2">
              {/* Accordion 1: Tailoring & Specifications */}
              <div className="border border-[#e3ded3] rounded-xl overflow-hidden bg-[#fcfbf7]">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')}
                  className="w-full p-4 flex items-center justify-between text-left font-display uppercase tracking-wider text-xs font-bold text-[#3d2b1f] cursor-pointer hover:bg-[#ede8dc]/40 transition-colors"
                >
                  <span>Atelier Tailoring &amp; Specifications</span>
                  {openAccordion === 'specs' ? (
                    <ChevronUp className="w-4 h-4 text-[#a8825b]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#a8825b]" />
                  )}
                </button>
                {openAccordion === 'specs' && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[#6e5d52] leading-relaxed border-t border-[#e3ded3]/50">
                    <p>
                      Every Vincent &amp; Vintage piece is crafted under strict quality control. From precision stitching to hand-inspected finishing, our designs prioritize longevity, breathability, and natural drape for discerning gentlemen.
                    </p>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                      <li>Bespoke stitching with reinforced stress seams</li>
                      <li>Hand-finished detailing &amp; mother-of-pearl or custom metal hardware</li>
                      <li>Preshrunk textiles ensuring dimensional stability after washing</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Care Instructions */}
              <div className="border border-[#e3ded3] rounded-xl overflow-hidden bg-[#fcfbf7]">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? '' : 'care')}
                  className="w-full p-4 flex items-center justify-between text-left font-display uppercase tracking-wider text-xs font-bold text-[#3d2b1f] cursor-pointer hover:bg-[#ede8dc]/40 transition-colors"
                >
                  <span>Care &amp; Longevity Instructions</span>
                  {openAccordion === 'care' ? (
                    <ChevronUp className="w-4 h-4 text-[#a8825b]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#a8825b]" />
                  )}
                </button>
                {openAccordion === 'care' && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[#6e5d52] leading-relaxed border-t border-[#e3ded3]/50">
                    {isApparelCategory ? (
                      <p>
                        Gentle machine wash with cold water (30&deg;C) using mild liquid detergent. Wash inside-out with like colors. Do not bleach or tumble dry. Warm iron on reverse side or steam lightly to restore texture.
                      </p>
                    ) : (
                      <p>
                        Wipe gently with a clean micro-fiber cloth. Keep away from direct excessive moisture or prolonged sunlight. Use specialized leather balm once every few months to maintain its rich natural patina.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 3: Delivery Timelines */}
              <div className="border border-[#e3ded3] rounded-xl overflow-hidden bg-[#fcfbf7]">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')}
                  className="w-full p-4 flex items-center justify-between text-left font-display uppercase tracking-wider text-xs font-bold text-[#3d2b1f] cursor-pointer hover:bg-[#ede8dc]/40 transition-colors"
                >
                  <span>Nationwide Doorstep Delivery</span>
                  {openAccordion === 'delivery' ? (
                    <ChevronUp className="w-4 h-4 text-[#a8825b]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#a8825b]" />
                  )}
                </button>
                {openAccordion === 'delivery' && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[#6e5d52] leading-relaxed border-t border-[#e3ded3]/50 space-y-1.5">
                    <p>
                      <strong>Inside Dhaka City:</strong> 24 to 48 hours delivery (৳ 60).
                    </p>
                    <p>
                      <strong>Outside Dhaka (Nationwide):</strong> 48 to 72 hours via premium courier (৳ 120).
                    </p>
                    <p className="text-xs text-[#878278]">
                      Orders are shipped in signature protective atelier packaging. You may inspect the parcel upon delivery and pay via Cash on Delivery or Mobile Banking.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            COMPLETE THE LOOK / RELATED ATELIER PIECES
            ======================================================== */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24 pt-10 border-t border-[#e3ded3]">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase font-display tracking-[0.2em] font-bold text-[#a8825b] block mb-1">
                Atelier Recommendations
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-wider text-[#3d2b1f]">
                Complete The Look
              </h2>
              <p className="text-xs sm:text-sm text-[#6e5d52] mt-1">
                Curated Old Money pairings crafted to harmonize with this piece.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Fullscreen Zoom Modal */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#1a100b]/92 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setZoomModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage || product.primaryImage}
            alt={product.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Sticky Mobile Buy Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#fcfbf7]/98 backdrop-blur-md border-t border-[#e3ded3] px-3.5 py-2.5 shadow-[0_-6px_25px_rgba(20,12,7,0.12)] pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <div className="flex items-baseline gap-1.5 font-display">
              <span className="text-lg font-bold text-[#3d2b1f]">
                TK. {Number(product.salePrice).toLocaleString()}
              </span>
              {product.regularPrice > product.salePrice && (
                <span className="line-through text-xs text-[#878278]">
                  TK. {Number(product.regularPrice).toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#a8825b] font-display uppercase tracking-wider font-semibold block">
              {isSingle ? 'Universal Fit' : `Selected Size: ${selectedSize}`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              disabled={isCurrentSelectionDepleted}
              onClick={handleAddToBag}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                isCurrentSelectionDepleted
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'border-[#4e3828] text-[#4e3828] hover:bg-[#4e3828] hover:text-white'
              }`}
              title="Add to Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>

            <button
              disabled={isCurrentSelectionDepleted}
              onClick={handleOrderNowCod}
              className={`flex-1 py-2.5 px-4 rounded-xl font-display uppercase tracking-wider text-xs font-bold transition-all shadow-md text-center ${
                isCurrentSelectionDepleted
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#977b63] via-[#b89579] to-[#977b63] text-white hover:from-[#3e2b1f] hover:to-[#3e2b1f]'
              }`}
            >
              {isSoldOut ? 'Sold Out' : 'Order Now (COD)'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

