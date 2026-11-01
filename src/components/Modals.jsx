'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Star,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  FileDown,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { generateOrderInvoice } from '@/utils/invoiceGenerator';

export default function Modals() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    cartDrawerOpen,
    setCartDrawerOpen,
    authModalOpen,
    setAuthModalOpen,
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    cartSubtotal,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    setUser,
    showToast,
    toast
  } = useStore();

  // Quick View state
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);

  // Checkout state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('Inside Dhaka');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Auth Modal state
  const [otpPhone, setOtpPhone] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImage(quickViewProduct.primaryImage);
      const isSingle =
        quickViewProduct.inventoryType === 'single' ||
        !quickViewProduct.sizes ||
        quickViewProduct.sizes.length === 0;

      // Find first color with stock if available
      const colors = Array.isArray(quickViewProduct.colors) ? quickViewProduct.colors : [];
      const firstInStockColor =
        colors.find((c) => Number(c.stock) > 0)?.name ||
        colors[0]?.name ||
        'Standard';
      setSelectedColor(firstInStockColor);

      if (isSingle) {
        setSelectedSize('ONE_SIZE');
      } else {
        const colorObj = colors.find((c) => c.name === firstInStockColor) || colors[0];
        const colorSizes = colorObj?.sizes && colorObj.sizes.length > 0 ? colorObj.sizes : quickViewProduct.sizes;
        const inStockSize =
          colorSizes?.find((s) => Number(s.stock) > 0)?.size ||
          colorSizes?.[0]?.size ||
          'L';
        setSelectedSize(inStockSize);
      }
      setQty(1);
    }
  }, [quickViewProduct]);

  const currentColorObj =
    quickViewProduct?.colors?.find((c) => c.name === selectedColor) ||
    quickViewProduct?.colors?.[0];

  const availableSizesForColor =
    currentColorObj?.sizes && currentColorObj.sizes.length > 0
      ? currentColorObj.sizes
      : quickViewProduct?.sizes || [];

  const activeSizeObj = availableSizesForColor.find((s) => s.size === selectedSize);
  const isSingle = quickViewProduct
    ? quickViewProduct.inventoryType === 'single' ||
      !quickViewProduct.sizes ||
      quickViewProduct.sizes.length === 0
    : false;
  const totalStock = quickViewProduct
    ? Number(quickViewProduct.totalStock !== undefined ? quickViewProduct.totalStock : 0)
    : 0;
  const threshold = quickViewProduct ? Number(quickViewProduct.lowStockThreshold) || 5 : 5;
  const isSoldOut = quickViewProduct ? quickViewProduct.isSoldOut || totalStock <= 0 : false;
  const isLowStock = quickViewProduct
    ? !isSoldOut && (quickViewProduct.isLowStock || totalStock <= threshold)
    : false;

  const currentVariantStock = isSingle
    ? Number(currentColorObj?.stock !== undefined ? currentColorObj.stock : totalStock)
    : activeSizeObj
    ? Number(activeSizeObj.stock) || 0
    : 0;
  const maxAvailableQty = currentVariantStock;
  const isCurrentSelectionDepleted = isSoldOut || maxAvailableQty <= 0;

  const handleSelectColor = (colorName) => {
    setSelectedColor(colorName);
    const targetC = quickViewProduct?.colors?.find((c) => c.name === colorName);
    if (targetC?.sizes && targetC.sizes.length > 0) {
      const currentSizeStock = targetC.sizes.find((s) => s.size === selectedSize)?.stock || 0;
      if (currentSizeStock <= 0) {
        const firstInStock = targetC.sizes.find((s) => Number(s.stock) > 0)?.size || targetC.sizes[0]?.size;
        if (firstInStock) setSelectedSize(firstInStock);
      }
    }
  };

  const deliveryCharge = deliveryZone === 'Inside Dhaka' ? 60 : 120;
  const grandTotal = cartSubtotal + deliveryCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          shippingAddress,
          deliveryZone,
          paymentMethod,
          paymentNumber,
          transactionId,
          notes,
          items: cart
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order placement failed');
      setConfirmedOrder(data.order);
      clearCart();
      showToast(`Order #${data.order.orderNumber || data.order.id} Confirmed!`);
    } catch (err) {
      showToast(err.message || 'Error creating order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[10000] bg-[#4e3828] text-white border-l-4 border-[#c59f72] px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 text-sm font-display tracking-wide animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#f9af5e]" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. QUICK VIEW MODAL (Matte Ivory) */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1a100b]/60 backdrop-blur-xs"
            onClick={() => setQuickViewProduct(null)}
          />
          <div className="relative bg-[#fcfbf7] border border-[#e3ded3] w-full max-w-4xl rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[92vh] flex flex-col text-[#3d2b1f]">
            {/* Top Bar */}
            <div className="bg-[#ede8dc] border-b border-[#e3ded3] py-3.5 px-6 flex items-center justify-between">
              <span className="text-xs font-mono text-[#6e5d52]">SKU: {quickViewProduct.sku}</span>
              <p className="text-center text-lg sm:text-xl font-display uppercase tracking-widest text-[#3d2b1f] font-bold">
                Quick View
              </p>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="bg-[#4e3828] text-white hover:bg-[#3e2b1f] rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-12 gap-6 sm:gap-8">
              {/* Left 6 Cols */}
              <div className="col-span-12 lg:col-span-6 flex flex-col-reverse sm:flex-row-reverse gap-3.5 items-start">
                <figure className="w-full sm:flex-1 aspect-[4/5] bg-[#ede8dc] rounded-xl overflow-hidden border border-[#e3ded3]">
                  <img
                    src={activeImage || quickViewProduct.primaryImage}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="flex sm:flex-col gap-2.5 overflow-auto">
                  {[
                    quickViewProduct.primaryImage,
                    quickViewProduct.hoverImage,
                    ...(quickViewProduct.gallery || [])
                  ]
                    .filter((v, i, a) => v && a.indexOf(v) === i)
                    .map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`w-16 h-18 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                          activeImage === imgUrl ? 'border-[#a8825b]' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Right 6 Cols */}
              <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#a8825b] font-display font-bold">
                    {quickViewProduct.category}
                  </span>
                  <h2 className="text-[#3d2b1f] text-2xl lg:text-3xl font-display font-bold mt-1.5 leading-snug">
                    {quickViewProduct.name}
                  </h2>

                  {/* Price */}
                  <p className="text-2xl lg:text-3xl text-[#3d2b1f] mt-2 mb-3.5 font-display font-bold">
                    TK. {Number(quickViewProduct.salePrice).toLocaleString()}
                    {quickViewProduct.regularPrice > quickViewProduct.salePrice && (
                      <span className="line-through text-base text-[#878278] ms-2.5 font-normal">
                        TK. {Number(quickViewProduct.regularPrice).toLocaleString()}
                      </span>
                    )}
                  </p>

                  {/* Rating Pill */}
                  <div className="text-sm font-display bg-[#ede8dc] border border-[#e3ded3] px-3 py-1.5 rounded-lg mb-4 inline-flex items-center gap-2">
                    <span className="font-bold text-[#3d2b1f]">{quickViewProduct.rating || '4.9'}</span>
                    <Star className="w-4 h-4 fill-[#fbca51] text-[#fbca51]" />
                    <span className="text-xs text-[#6e5d52]">
                      ({quickViewProduct.reviewsCount || 24} Reviews)
                    </span>
                  </div>

                  {/* Dynamic Stock & Atelier Alerts */}
                  {isSoldOut ? (
                    <div className="bg-[#4e3828] text-white border border-[#c59f72]/50 p-3.5 rounded-xl mb-4 text-xs font-display flex items-center gap-2.5 shadow-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#f4b66b]" />
                      <span>
                        <strong className="tracking-wider">SOLD OUT:</strong> This piece is currently fully committed. Sizing &amp; orders are locked until the next workshop release.
                      </span>
                    </div>
                  ) : isLowStock ? (
                    <div className="bg-amber-500/10 border border-amber-600/30 text-amber-900 p-3 rounded-xl mb-4 text-xs font-display flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                      <span>
                        <strong>LIMITED PRODUCTION:</strong> Only <strong>{totalStock}</strong> units remaining in central atelier stock.
                      </span>
                    </div>
                  ) : null}

                  {quickViewProduct.fabric && (
                    <p className="text-xs sm:text-sm text-[#3d2b1f] bg-[#ede8dc] border-l-3 border-[#a8825b] px-3.5 py-2.5 rounded-r-lg mb-4">
                      <strong className="text-[#a8825b]">Material &amp; Specs:</strong> {quickViewProduct.fabric}
                    </p>
                  )}

                  <p className="text-sm sm:text-base text-[#6e5d52] leading-relaxed mb-5">
                    {quickViewProduct.description}
                  </p>

                  {/* ========================================================
                      HIERARCHICAL SELECTION: 1. COLOUR -> 2. SIZE (M/L/XL)
                      ======================================================== */}
                  
                  {/* STEP 1: Select Colour */}
                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-display uppercase tracking-wider font-bold text-[#3d2b1f]">
                          1. Select Colour: <span className="text-[#a8825b]">{selectedColor}</span>
                        </span>
                        {currentColorObj && (
                          <span className="text-xs text-[#6e5d52]">
                            {Number(currentColorObj.stock) <= 0
                              ? 'Colour Out of Stock'
                              : `${currentColorObj.stock} units in this shade`}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2.5 flex-wrap">
                        {quickViewProduct.colors.map((c) => {
                          const cStock = Number(c.stock !== undefined ? c.stock : 0);
                          const isColorOut = cStock <= 0;
                          const isSelected = selectedColor === c.name;

                          return (
                            <button
                              key={c.name}
                              disabled={isColorOut}
                              onClick={() => handleSelectColor(c.name)}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#4e3828] bg-[#4e3828] text-white shadow-xs'
                                  : isColorOut
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed opacity-60'
                                  : 'border-[#e3ded3] bg-white text-[#3d2b1f] hover:border-[#a8825b]'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                              {isColorOut ? (
                                <span className="text-[10px] text-red-500 font-bold">(Out)</span>
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
                    <div className="mb-5 bg-[#ede8dc]/80 border border-[#e3ded3] p-3.5 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-display uppercase tracking-wider font-semibold text-[#3d2b1f]">
                        <span>Fit: Universal / One Size Spec</span>
                        <span className={isSoldOut || currentVariantStock <= 0 ? 'text-red-700 font-bold' : currentVariantStock <= threshold ? 'text-amber-800 font-bold' : 'text-emerald-800 font-medium'}>
                          {currentVariantStock <= 0 ? 'Sold Out' : `${currentVariantStock} units available`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6e685f] mt-1">
                        Crafted to standard universal accessory dimensions. No garment sizing required.
                      </p>
                    </div>
                  ) : (
                    availableSizesForColor && availableSizesForColor.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-display uppercase tracking-wider font-bold text-[#3d2b1f]">
                            2. Select Size ({selectedColor}): <span className="text-[#a8825b]">{selectedSize}</span>
                          </span>
                          {activeSizeObj && (
                            <span className={`text-xs ${Number(activeSizeObj.stock) <= 0 ? 'text-red-600 font-bold' : Number(activeSizeObj.stock) <= threshold ? 'text-amber-700 font-bold' : 'text-[#6e5d52]'}`}>
                              Chest: {activeSizeObj.chest}&quot; | Length: {activeSizeObj.length}&quot; &bull;{' '}
                              {Number(activeSizeObj.stock) <= 0
                                ? 'Out of Stock'
                                : Number(activeSizeObj.stock) <= threshold
                                ? `Only ${activeSizeObj.stock} Left`
                                : `${activeSizeObj.stock} in stock`}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2.5 flex-wrap">
                          {availableSizesForColor.map((s) => {
                            const out = Number(s.stock) <= 0;
                            const low = Number(s.stock) > 0 && Number(s.stock) <= threshold;
                            return (
                              <button
                                key={s.size}
                                disabled={out}
                                onClick={() => setSelectedSize(s.size)}
                                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-display uppercase tracking-wider border transition-all cursor-pointer relative ${
                                  selectedSize === s.size
                                    ? 'bg-[#4e3828] text-white border-[#4e3828] font-bold shadow-xs'
                                    : out
                                    ? 'bg-[#ece8df] text-gray-400 border-gray-300 line-through cursor-not-allowed'
                                    : 'bg-white text-[#6e5d52] border-[#e3ded3] hover:border-[#a8825b]'
                                }`}
                              >
                                {s.size}
                                {low && !out && (
                                  <span className="ml-1.5 text-[10px] text-[#c59f72] font-mono font-bold">
                                    ({s.stock})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Quantity & CTAs */}
                <div className="pt-4 border-t border-[#e3ded3] flex flex-wrap items-center gap-3">
                  <div className="flex items-center border border-[#e3ded3] rounded-lg bg-white">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={isCurrentSelectionDepleted || qty <= 1}
                      className="px-3.5 py-2 text-gray-600 hover:text-[#3d2b1f] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-[#3d2b1f]">{qty}</span>
                    <button
                      onClick={() => {
                        if (maxAvailableQty > 0 && qty >= maxAvailableQty) {
                          showToast(`Maximum ${maxAvailableQty} unit(s) available in stock.`);
                          return;
                        }
                        setQty(qty + 1);
                      }}
                      disabled={isCurrentSelectionDepleted || (maxAvailableQty > 0 && qty >= maxAvailableQty)}
                      className="px-3.5 py-2 text-gray-600 hover:text-[#3d2b1f] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    disabled={isCurrentSelectionDepleted}
                    onClick={() => {
                      addToCart(quickViewProduct, isSingle ? 'ONE_SIZE' : selectedSize, selectedColor, qty, true);
                      setQuickViewProduct(null);
                    }}
                    className={`flex-1 py-3 px-5 rounded-lg font-display uppercase tracking-wider text-xs sm:text-sm font-bold transition-colors ${
                      isCurrentSelectionDepleted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#4e3828] hover:bg-[#3e2b1f] text-white cursor-pointer'
                    }`}
                  >
                    {isSoldOut ? 'Sold Out' : isCurrentSelectionDepleted ? 'Size Depleted' : 'Add To Bag'}
                  </button>

                  <button
                    disabled={isCurrentSelectionDepleted}
                    onClick={() => {
                      addToCart(quickViewProduct, isSingle ? 'ONE_SIZE' : selectedSize, selectedColor, qty, false);
                      setQuickViewProduct(null);
                      setCheckoutModalOpen(true);
                    }}
                    className={`w-full py-3 px-5 rounded-lg font-display uppercase tracking-widest text-xs sm:text-sm font-bold text-center shadow-md ${
                      isCurrentSelectionDepleted
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#977b63] to-[#c0a086] hover:from-[#3e2b1f] hover:to-[#3e2b1f] text-white cursor-pointer'
                    }`}
                  >
                    {isSoldOut ? 'Currently Unavailable' : 'Order Now — Cash on Delivery'}
                  </button>

                  <Link
                    href={`/products/${quickViewProduct.slug}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="w-full block py-2.5 px-4 text-center text-xs font-display uppercase tracking-widest font-bold text-[#a8825b] hover:text-[#3d2b1f] border border-[#e3ded3] rounded-lg bg-[#ede8dc]/50 hover:bg-[#ede8dc] transition-all"
                  >
                    Open Full Bespoke Product Page &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SLIDE-OUT SHOPPING BAG */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-[9000] flex justify-end">
          <div
            className="fixed inset-0 bg-[#160d08]/70 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setCartDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#fdfbf7] border-l border-[#ded6c9] h-full z-10 flex flex-col justify-between shadow-2xl text-[#3d2b1f] animate-in slide-in-from-right duration-300">
            {/* 1. Atelier Drawer Header */}
            <div className="bg-gradient-to-r from-[#4e3828] via-[#473224] to-[#38251a] text-white p-5 border-b border-[#c59f72]/40 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-[#c59f72]/50 flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-5 h-5 text-[#f4b66b]" />
                  </div>
                  <div>
                    <h3 className="font-display uppercase tracking-[0.16em] font-bold text-base text-[#fcfbf7]">
                      Shopping Bag
                    </h3>
                    <span className="text-[11px] text-[#d6c7b7] tracking-wider uppercase font-medium">
                      {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} {cart.reduce((sum, item) => sum + (item.quantity || 1), 0) === 1 ? 'Selected Piece' : 'Selected Pieces'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#c59f72]/30 text-[#e8ded3] hover:text-[#f4b66b] flex items-center justify-center border border-white/10 hover:border-[#c59f72]/50 transition-all cursor-pointer"
                  title="Close Bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Complimentary Express Delivery Progress Bar */}
              <div className="mt-4 pt-3.5 border-t border-white/10">
                <div className="flex items-center justify-between text-xs mb-1.5 font-display tracking-wider">
                  {cartSubtotal >= 3000 ? (
                    <span className="text-[#f4b66b] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Complimentary Delivery Unlocked!
                    </span>
                  ) : (
                    <span className="text-[#d8cdbf]">
                      Add <strong className="text-[#f4b66b]">TK. {(3000 - cartSubtotal).toLocaleString()}</strong> for Free Delivery
                    </span>
                  )}
                  <span className="text-[#f4b66b] font-bold text-[11px]">
                    {Math.min(100, Math.round((cartSubtotal / 3000) * 100))}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#301f15]/30 rounded-full overflow-hidden p-0.5 border border-[#c59f72]/30">
                  <div
                    className="h-full bg-gradient-to-r from-[#c59f72] via-[#e6ca9f] to-[#f4b66b] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((cartSubtotal / 3000) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Drawer Body (Empty vs Populated) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-[#fbf9f4]">
              {cart.length === 0 ? (
                <div className="py-24 px-4 text-center flex flex-col items-center justify-center">
                  {/* Luxury Medallion */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ede7da] to-[#dad1be] border-2 border-[#c59f72]/40 flex items-center justify-center shadow-inner mb-4">
                    <ShoppingBag className="w-9 h-9 text-[#4e3828]" />
                  </div>

                  {/* Empty Bag Title & Description */}
                  <h4 className="font-display uppercase tracking-[0.18em] text-[#3a281c] font-bold text-base sm:text-lg mb-1.5">
                    Your Shopping Bag is Empty
                  </h4>
                  <p className="text-xs text-[#7b6d61] max-w-xs leading-relaxed font-normal">
                    Explore our collections and select your tailored fit.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3.5 p-3.5 rounded-2xl border border-[#e3ded3] bg-white shadow-2xs hover:border-[#c59f72]/60 hover:shadow-sm transition-all"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-xl border border-[#e3ded3] shrink-0 bg-[#f4efe6]"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={item.slug ? `/products/${item.slug}` : '#'}
                            onClick={() => setCartDrawerOpen(false)}
                            className="text-sm font-bold text-[#3a281c] font-display hover:text-[#a8825b] transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.key)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f4efe6] text-[#4e3828] border border-[#e5dfd3]">
                            Size: {item.size === 'ONE_SIZE' ? 'Universal' : item.size}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#f4efe6] text-[#554336] border border-[#e5dfd3]">
                            {item.color}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f2ede4]">
                        {/* Tactile Stepper */}
                        <div className="inline-flex items-center border border-[#d8d0c2] rounded-lg bg-[#fbf9f5] shadow-2xs overflow-hidden">
                          <button
                            onClick={() => updateCartQty(item.key, -1)}
                            className="w-7 h-7 flex items-center justify-center text-[#554336] hover:bg-[#4e3828] hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#3a281c] min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.key, 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#554336] hover:bg-[#4e3828] hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-display font-bold text-[#3a281c]">
                            TK. {(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-[#86776b]">
                              TK. {item.price.toLocaleString()} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. Populated State Drawer Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#e3ded3] bg-[#f5f0e6] space-y-3 shadow-lg pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-[0.16em] text-[#786759] font-display font-bold">
                      Estimated Subtotal
                    </span>
                    <p className="text-[11px] text-[#8e7e72]">Delivery calculated at checkout</p>
                  </div>
                  <span className="font-display font-bold text-2xl text-[#3a281c]">
                    TK. {cartSubtotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    setConfirmedOrder(null);
                    setCheckoutModalOpen(true);
                  }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#4e3828] via-[#473224] to-[#38251a] hover:from-[#432f22] hover:to-[#301f15] text-[#fbf9f5] border border-[#c59f72]/50 font-display uppercase tracking-[0.18em] text-sm font-bold shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Cash on Delivery</span>
                  <ArrowRight className="w-4 h-4 text-[#f4b66b] group-hover:translate-x-1.5 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#736356] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#a8825b]" />
                  <span>Cash on Delivery Nationwide • Parcel Inspection Allowed</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. GUEST PHONE CHECKOUT MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-[9500] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-[#1a100b]/60 backdrop-blur-xs"
            onClick={() => setCheckoutModalOpen(false)}
          />
          <div className="relative bg-[#fcfbf7] border border-[#e3ded3] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[92vh] sm:max-h-[94vh] flex flex-col text-[#3d2b1f] animate-in slide-in-from-bottom sm:slide-in-from-none duration-300">
            <div className="bg-[#4e3828] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display uppercase tracking-wider text-lg sm:text-xl font-bold text-[#f9af5e]">
                  {confirmedOrder ? 'Order Confirmed!' : 'Express Cash-on-Delivery Checkout'}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-200">
                  Vincent &amp; Vintage — No registration or password required
                </p>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1 text-gray-300 hover:text-white cursor-pointer rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-7 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+24px)] sm:pb-7">
              {confirmedOrder ? (
                <div className="text-center py-4 sm:py-6 space-y-4">
                  <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-[#a8825b] mx-auto" />
                  <h4 className="text-xl sm:text-2xl font-display font-bold text-[#3d2b1f]">
                    Thank You, {confirmedOrder.customerName}!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6e5d52]">
                    Your Order <strong className="text-[#a8825b]">#{confirmedOrder.orderNumber}</strong> has been received.
                    Our executive will call <strong>{confirmedOrder.customerPhone}</strong> to confirm dispatch.
                  </p>
                  <div className="bg-[#ede8dc] border border-[#e3ded3] rounded-xl p-4 sm:p-5 max-w-md mx-auto text-left text-xs sm:text-sm space-y-2">
                    <p><strong>Order Number:</strong> {confirmedOrder.orderNumber}</p>
                    <p><strong>Delivery Zone:</strong> {confirmedOrder.deliveryZone} (TK. {confirmedOrder.deliveryCharge})</p>
                    <p><strong>Payment Method:</strong> {confirmedOrder.paymentMethod}</p>
                    <p className="text-base font-bold text-[#3d2b1f] pt-1">
                      Total Payable: TK. {Number(confirmedOrder.totalAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-3">
                    <button
                      onClick={() => generateOrderInvoice(confirmedOrder)}
                      className="inline-flex items-center gap-2 bg-[#4e3828] text-white px-5 sm:px-6 py-3 rounded-lg font-display uppercase tracking-wider text-xs sm:text-sm font-bold hover:bg-[#3e2b1f] cursor-pointer shadow-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Download PDF Invoice
                    </button>
                    <button
                      onClick={() => {
                        setConfirmedOrder(null);
                        setCheckoutModalOpen(false);
                      }}
                      className="px-5 sm:px-6 py-3 rounded-lg border border-gray-300 text-xs sm:text-sm font-display uppercase tracking-wider font-semibold hover:border-[#3d2b1f]"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Abdullah Al Nahin"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-xl px-3.5 py-3 text-base text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] mb-1.5">
                        Mobile Number (11 Digits) *
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        placeholder="01XXXXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-xl px-3.5 py-3 text-base text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] mb-1.5">
                      Full Delivery Address (House, Road, Area, District) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. House 12, Road 5, Banani, Dhaka"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-xl px-3.5 py-2.5 text-base text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>

                  {/* Delivery Destination - Responsive Large Tappable Cards */}
                  <div>
                    <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] mb-1.5">
                      Delivery Destination
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryZone('Inside Dhaka')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          deliveryZone === 'Inside Dhaka'
                            ? 'bg-[#4e3828] text-white border-[#4e3828] shadow-sm'
                            : 'bg-[#fcfbf7] text-[#3d2b1f] border-[#e3ded3] hover:border-[#a8825b]'
                        }`}
                      >
                        <span className="block font-display font-bold text-xs uppercase tracking-wider">
                          Inside Dhaka
                        </span>
                        <span className={`text-[11px] font-mono font-semibold ${deliveryZone === 'Inside Dhaka' ? 'text-[#f4b66b]' : 'text-[#6e5d52]'}`}>
                          TK. 60 (24-48h)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryZone('Outside Dhaka')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          deliveryZone === 'Outside Dhaka'
                            ? 'bg-[#4e3828] text-white border-[#4e3828] shadow-sm'
                            : 'bg-[#fcfbf7] text-[#3d2b1f] border-[#e3ded3] hover:border-[#a8825b]'
                        }`}
                      >
                        <span className="block font-display font-bold text-xs uppercase tracking-wider">
                          Outside Dhaka
                        </span>
                        <span className={`text-[11px] font-mono font-semibold ${deliveryZone === 'Outside Dhaka' ? 'text-[#f4b66b]' : 'text-[#6e5d52]'}`}>
                          TK. 120 (Courier)
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Card */}
                  <div>
                    <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] mb-1.5">
                      Payment Method
                    </label>
                    <div className="bg-[#ede8dc]/60 border border-[#e3ded3] rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#4e3828] text-white flex items-center justify-center font-bold text-xs">
                          COD
                        </div>
                        <div>
                          <span className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-[#3d2b1f] block">
                            Cash on Delivery (Standard)
                          </span>
                          <span className="text-[11px] text-[#6e5d52]">
                            Pay cash after inspecting your parcel
                          </span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Order Summary Box */}
                  <div className="bg-[#ede8dc]/50 p-3.5 sm:p-5 rounded-xl border border-[#e3ded3] text-sm space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm text-[#6e5d52]">
                      <span>Items Subtotal ({cart.length} items)</span>
                      <span className="font-semibold text-[#3d2b1f]">TK. {cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-[#6e5d52]">
                      <span>Delivery Charge ({deliveryZone})</span>
                      <span className="font-semibold text-[#3d2b1f]">TK. {deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#e3ded3] pt-2 text-base sm:text-lg font-display font-bold text-[#3d2b1f]">
                      <span>Total Payable</span>
                      <span className="text-[#4e3828]">TK. {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder || cart.length === 0}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#4e3828] via-[#473224] to-[#38251a] hover:from-[#432f22] hover:to-[#301f15] text-[#fbf9f5] border border-[#c59f72]/50 font-display uppercase tracking-[0.16em] text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingOrder ? 'Placing Order...' : `Confirm Order — TK. ${grandTotal.toLocaleString()}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[9500] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1a100b]/60 backdrop-blur-xs"
            onClick={() => setAuthModalOpen(false)}
          />
          <div className="relative bg-[#ffffff] border border-[#e3ded3] w-full max-w-3xl rounded-2xl shadow-2xl z-10 overflow-hidden text-[#3d2b1f]">
            {/* Top Bar */}
            <div className="bg-[#ede8dc] border-b border-[#e3ded3] flex flex-wrap justify-center items-center gap-4 py-4 px-4 relative">
              <button
                onClick={() => {
                  setUser({ name: 'Facebook Member', phone: '01700000000' });
                  setAuthModalOpen(false);
                  showToast('Signed in via Facebook');
                }}
                className="flex items-center rounded-md overflow-hidden cursor-pointer shadow-xs"
              >
                <span className="bg-[#163059] text-white px-3 py-2 text-xs font-bold">f</span>
                <span className="bg-[#0f549a] text-white text-xs font-display tracking-wider py-2 px-4 font-bold">
                  LOGIN WITH FACEBOOK
                </span>
              </button>

              <button
                onClick={() => {
                  setUser({ name: 'Google Member', phone: '01700000000' });
                  setAuthModalOpen(false);
                  showToast('Signed in via Google');
                }}
                className="flex items-center rounded-md overflow-hidden cursor-pointer shadow-xs"
              >
                <span className="bg-[#A42623] text-white px-3 py-2 text-xs font-bold">G</span>
                <span className="bg-[#E33C2A] text-white text-xs font-display tracking-wider py-2 px-4 font-bold">
                  LOGIN WITH GOOGLE
                </span>
              </button>

              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute right-4 top-4 bg-[#4e3828] text-white rounded-full p-1.5 hover:bg-[#3e2b1f] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* OTP Login */}
              <div className="flex flex-col items-center justify-center pb-6 border-b border-[#e3ded3]">
                <p className="text-center text-base lg:text-lg text-[#3d2b1f] font-display uppercase tracking-widest pb-3 font-bold">
                  LOGIN WITH OTP CODE
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="tel"
                    placeholder="01xxx-xxxxxx"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className="bg-white border border-[#e3ded3] py-2.5 px-4 text-center rounded-lg w-64 text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none tracking-widest text-sm"
                  />
                  <button
                    onClick={() => {
                      if (!otpPhone) return showToast('Enter your 11-digit mobile number');
                      setUser({ name: otpPhone, phone: otpPhone });
                      setAuthModalOpen(false);
                      showToast(`Verified OTP for ${otpPhone}`);
                    }}
                    className="bg-gradient-to-r from-[#977b63] to-[#c0a086] text-white py-2.5 px-6 rounded-lg font-display uppercase tracking-wider text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    SEND CODE
                  </button>
                </div>
              </div>

              {/* 2-Column Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setUser({ name: loginPhone || 'Member', phone: loginPhone });
                    setAuthModalOpen(false);
                    showToast('Welcome back to Vincent & Vintage!');
                  }}
                  className="md:border-r md:border-[#e3ded3] md:pr-6 space-y-3.5"
                >
                  <p className="text-[#3d2b1f] text-lg font-display uppercase font-bold">LOGIN</p>
                  <div>
                    <label className="text-[#6e5d52] text-xs block mb-1">Mobile number</label>
                    <input
                      type="text"
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-white border border-[#e3ded3] rounded-lg py-2 px-3 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                    />
                  </div>
                  <div>
                    <label className="text-[#6e5d52] text-xs block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full bg-white border border-[#e3ded3] rounded-lg py-2 px-3 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#4e3828] hover:bg-[#3e2b1f] text-white rounded-lg px-6 py-2 text-xs font-display uppercase tracking-wider font-bold cursor-pointer transition-colors"
                  >
                    LOGIN
                  </button>
                </form>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setUser({ name: 'New Member', phone: '01700000000' });
                    setAuthModalOpen(false);
                    showToast('Account registered!');
                  }}
                  className="space-y-3.5"
                >
                  <p className="text-[#3d2b1f] text-lg font-display uppercase font-bold">REGISTER</p>
                  <div>
                    <label className="text-[#6e5d52] text-xs block mb-1">Mobile number</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white border border-[#e3ded3] rounded-lg py-2 px-3 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                    />
                  </div>
                  <div>
                    <label className="text-[#6e5d52] text-xs block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full bg-white border border-[#e3ded3] rounded-lg py-2 px-3 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#4e3828] hover:bg-[#3e2b1f] text-white rounded-lg px-6 py-2 text-xs font-display uppercase tracking-wider font-bold cursor-pointer transition-colors"
                  >
                    REGISTER
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
