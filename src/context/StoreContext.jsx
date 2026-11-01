'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vv_cart');
      const savedWish = localStorage.getItem('vv_wishlist');
      const savedUser = localStorage.getItem('vv_user');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWish) setWishlist(JSON.parse(savedWish));
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('vv_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('vv_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  };

  const addToCart = (product, size = 'L', color = null, quantity = 1, openDrawer = true) => {
    const selectedColor = color || product.colors?.[0]?.name || 'Standard';
    const key = `${product.id}-${size}-${selectedColor}`;

    setCart(prev => {
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.salePrice,
          regularPrice: product.regularPrice,
          image: product.primaryImage,
          size,
          color: selectedColor,
          quantity
        }
      ];
    });

    const sizeLabel = size === 'ONE_SIZE' ? '' : ` (Size: ${size})`;
    showToast(`Added "${product.name}"${sizeLabel} to bag`);
    if (openDrawer) setCartDrawerOpen(true);
  };

  const updateCartQty = (key, delta) => {
    setCart(prev =>
      prev
        .map(item => (item.key === key ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast('Removed from Wishlist');
        return prev.filter(p => p.id !== product.id);
      }
      showToast('Saved to Wishlist');
      return [...prev, product];
    });
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        cartSubtotal,
        cartDrawerOpen,
        setCartDrawerOpen,
        quickViewProduct,
        setQuickViewProduct,
        authModalOpen,
        setAuthModalOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
        user,
        setUser,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        showToast,
        toast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
