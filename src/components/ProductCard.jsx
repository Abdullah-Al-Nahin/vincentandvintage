'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Heart, ShoppingBag, Star, Zap, AlertTriangle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    wishlist,
    setQuickViewProduct,
    setCheckoutModalOpen
  } = useStore();

  const isSingle = product.inventoryType === 'single' || !product.sizes || product.sizes.length === 0;

  // Find first in-stock size if available
  const firstInStockSize = product.sizes?.find((s) => Number(s.stock) > 0)?.size || product.sizes?.[0]?.size || 'ONE_SIZE';
  const [selectedSize, setSelectedSize] = useState(isSingle ? 'ONE_SIZE' : firstInStockSize);
  const [hovered, setHovered] = useState(false);

  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const discountPercent =
    product.regularPrice > product.salePrice
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : 0;

  const totalStock = Number(product.totalStock !== undefined ? product.totalStock : 0);
  const threshold = Number(product.lowStockThreshold) || 5;
  const isSoldOut = product.isSoldOut || totalStock <= 0;
  const isLowStock = !isSoldOut && (product.isLowStock || totalStock <= threshold);

  // Check if selected size itself is out of stock
  const currentSizeObj = !isSingle && product.sizes?.find((s) => s.size === selectedSize);
  const isSelectedSizeOutOfStock = currentSizeObj ? Number(currentSizeObj.stock) <= 0 : false;

  return (
    <div
      className={`group bg-[#fcfbf7] rounded-xl border border-[#e3ded3] hover:border-[#b89579]/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        isSoldOut ? 'opacity-90' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        {/* Image Frame with Dual-Image Hover Swap & Dynamic Stock Badges */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ede8dc]">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <img
              src={hovered && product.hoverImage ? product.hoverImage : product.primaryImage}
              alt={product.name}
              className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 cursor-pointer ${
                isSoldOut ? 'filter grayscale-20 brightness-90' : ''
              }`}
            />
          </Link>

          {/* Sold Out Full Overlay Banner */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-[#3d2e24]/55 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <span className="bg-[#4e3828]/95 border border-[#c59f72]/60 text-white text-xs sm:text-sm font-display uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-md shadow-2xl">
                SOLD OUT
              </span>
            </div>
          )}

          {/* Low Stock Urgency Pill */}
          {!isSoldOut && isLowStock && (
            <span className="absolute top-3 right-3 z-10 bg-amber-600/95 text-white text-[11px] font-display font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>Only {totalStock} Left</span>
            </span>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && !isSoldOut && (
            <span className="absolute top-3 left-3 bg-[#4e3828] text-white text-xs font-display font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow">
              -{discountPercent}% OFF
            </span>
          )}

          {/* SKU Tag */}
          <span className="absolute bottom-3 left-3 bg-[#4e3828]/85 text-white text-xs font-mono px-2.5 py-0.5 rounded backdrop-blur-xs">
            {product.sku}
          </span>

          {/* Floating Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2.5 opacity-95 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => toggleWishlist(product)}
              className={`h-9 w-9 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-[#a8825b] text-white'
                  : 'bg-[#fcfbf7]/95 text-[#3d2b1f] hover:bg-[#a8825b] hover:text-white border border-[#e3ded3]'
              }`}
              title="Add to Wishlist"
            >
              <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            <Link
              href={`/products/${product.slug}`}
              className="h-9 w-9 rounded-full bg-[#fcfbf7]/95 text-[#3d2b1f] hover:bg-[#4e3828] hover:text-white flex items-center justify-center shadow-md transition-colors border border-[#e3ded3] cursor-pointer"
              title="View Atelier Product Page"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product Info with High-Res Fonts */}
        <div className="p-3 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#6e5d52] mb-1">
            <span className="uppercase tracking-widest font-display text-[#a8825b] font-semibold text-[10px] sm:text-xs">
              {product.category}
            </span>
            <span className="flex items-center gap-1 text-[#3d2b1f] font-semibold text-[11px] sm:text-xs">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#fbca51] text-[#fbca51]" />
              {product.rating || '4.8'}
            </span>
          </div>

          <h3 className="text-[13px] sm:text-base xl:text-[17px] text-[#3d2b1f] font-medium line-clamp-2 hover:text-[#a8825b] cursor-pointer transition-colors leading-snug min-h-[2.1rem] sm:min-h-[2.8rem]">
            <Link href={`/products/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {/* Price Row */}
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2.5 font-display">
            <span className="text-base sm:text-2xl font-bold text-[#3d2b1f] tracking-wide">
              TK. {Number(product.salePrice).toLocaleString()}
            </span>
            {product.regularPrice > product.salePrice && (
              <span className="line-through text-[11px] sm:text-sm text-[#878278]">
                TK. {Number(product.regularPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Size Selector Pills or Single Unit Specs */}
          {isSingle ? (
            <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[11px] sm:text-xs text-[#6e5d52]">
              <span className="font-display uppercase tracking-wider font-semibold bg-[#ede8dc] px-2 py-0.5 rounded-md">
                One Size
              </span>
              <span className={isLowStock ? 'text-amber-700 font-bold' : isSoldOut ? 'text-red-700 font-bold' : 'text-emerald-700 font-medium'}>
                {isSoldOut ? 'Sold Out' : isLowStock ? `${totalStock} left` : 'In Stock'}
              </span>
            </div>
          ) : (
            product.sizes && product.sizes.length > 0 && (
              <div className="mt-2.5 sm:mt-3 flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <span className="text-[11px] sm:text-xs text-[#6e5d52] mr-0.5">Size:</span>
                {product.sizes.map((s) => {
                  const out = Number(s.stock) <= 0;
                  const low = Number(s.stock) > 0 && Number(s.stock) <= threshold;
                  return (
                    <button
                      key={s.size}
                      disabled={out}
                      onClick={() => setSelectedSize(s.size)}
                      title={out ? 'Out of stock' : low ? `Only ${s.stock} left` : `${s.stock} in stock`}
                      className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border font-display transition-all cursor-pointer relative ${
                        selectedSize === s.size
                          ? 'bg-[#4e3828] text-white border-[#4e3828] font-bold shadow-xs'
                          : out
                          ? 'bg-[#ece8df] text-gray-400 border-gray-300 line-through cursor-not-allowed'
                          : 'bg-[#fcfbf7] text-[#6e5d52] border-[#e3ded3] hover:border-[#a8825b] hover:text-[#3d2b1f]'
                      }`}
                    >
                      {s.size}
                      {low && !out && (
                        <span className="ml-1 text-[9px] text-[#c59f72] font-mono font-bold hidden sm:inline">({s.stock})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-1">
        {isSoldOut ? (
          <Link
            href={`/products/${product.slug}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-display uppercase tracking-wider bg-[#4e3828] text-white hover:bg-[#3e2b1f] transition-all font-bold cursor-pointer border border-[#8e735d]"
          >
            <Eye className="w-4 h-4" />
            <span>Sold Out • View Piece</span>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => addToCart(product, isSingle ? 'ONE_SIZE' : selectedSize)}
              disabled={isSelectedSizeOutOfStock}
              className={`p-2 sm:py-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-display uppercase tracking-wider border transition-all font-bold cursor-pointer shrink-0 flex items-center justify-center ${
                isSelectedSizeOutOfStock
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'border-[#4e3828] text-[#4e3828] hover:bg-[#4e3828] hover:text-white hover:border-[#4e3828]'
              }`}
              title="Add to Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline ml-1.5">
                {isSelectedSizeOutOfStock ? 'Out' : 'Add Bag'}
              </span>
            </button>

            <button
              onClick={() => {
                addToCart(product, isSingle ? 'ONE_SIZE' : selectedSize, null, 1, false);
                setCheckoutModalOpen(true);
              }}
              disabled={isSelectedSizeOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-lg text-xs sm:text-sm font-display uppercase tracking-wider text-white transition-all font-bold shadow-xs cursor-pointer ${
                isSelectedSizeOutOfStock
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#977b63] to-[#c0a086] hover:from-[#3e2b1f] hover:to-[#3e2b1f]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="truncate">Order Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
