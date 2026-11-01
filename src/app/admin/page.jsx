'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingBag,
  Trash2,
  FileDown,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sliders,
  Image as ImageIcon,
  Plus,
  Eye,
  Tag,
  Grid,
  Search,
  Cloud,
  CheckSquare,
  Square,
  Filter,
  Sparkles,
  RefreshCw,
  Phone,
  MapPin,
  ExternalLink,
  Boxes,
  AlertTriangle,
  FileSpreadsheet,
  Edit3,
  TrendingDown,
  PackageCheck,
  Check,
  Clock,
  ArrowUpDown,
  History,
  X,
  Copy,
  Users,
  Lock,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { generateOrderInvoice } from '@/utils/invoiceGenerator';
import ImageUploadDropzone from '@/components/ImageUploadDropzone';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [tab, setTab] = useState('inventory'); // Default to Inventory Hub for immediate review
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [promoBlocks, setPromoBlocks] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({
    totalUnits: 0,
    totalProducts: 0,
    inStockCount: 0,
    lowStockCount: 0,
    soldOutCount: 0,
    estimatedValue: 0
  });
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search for Products Tab
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [productVisibilityFilter, setProductVisibilityFilter] = useState('all'); // all, active, hidden

  // Filters & Search for Inventory Hub Tab
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('all'); // all, low_stock, sold_out, healthy
  const [inventoryCatFilter, setInventoryCatFilter] = useState('all');
  const [quickRestockTargetMap, setQuickRestockTargetMap] = useState({}); // { [productId]: { color, size } }
  const [stockEditModal, setStockEditModal] = useState(null);

  // Orders & Customers Search
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // --- Product Form State ---
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCatSlug, setProdCatSlug] = useState('');
  const [prodRegPrice, setProdRegPrice] = useState('1850');
  const [prodSalePrice, setProdSalePrice] = useState('1390');
  const [prodFabric, setProdFabric] = useState('');
  const [prodPrimaryImg, setProdPrimaryImg] = useState('');
  const [prodHoverImg, setProdHoverImg] = useState('');
  const [prodAdditionalImgs, setProdAdditionalImgs] = useState([]);
  const [prodDesc, setProdDesc] = useState('');
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsNewArrival, setProdIsNewArrival] = useState(true);
  const [prodIsTodaysDeal, setProdIsTodaysDeal] = useState(false);

  // Hierarchical Inventory Model for New Product Form (Product -> Colour -> Sizes)
  const [prodInventoryType, setProdInventoryType] = useState('sizes'); // 'sizes' or 'single'
  const [prodLowStockThreshold, setProdLowStockThreshold] = useState('5');
  const [prodColors, setProdColors] = useState([
    {
      name: 'Ivory Cream',
      hex: '#F4F1EA',
      stock: 35,
      sizes: [
        { size: 'M', chest: '40', length: '28', stock: 10 },
        { size: 'L', chest: '42', length: '29', stock: 12 },
        { size: 'XL', chest: '44', length: '30', stock: 8 },
        { size: 'XXL', chest: '46', length: '31', stock: 5 }
      ]
    },
    {
      name: 'Sage Olive',
      hex: '#6B7A66',
      stock: 28,
      sizes: [
        { size: 'M', chest: '40', length: '28', stock: 8 },
        { size: 'L', chest: '42', length: '29', stock: 10 },
        { size: 'XL', chest: '44', length: '30', stock: 6 },
        { size: 'XXL', chest: '46', length: '31', stock: 4 }
      ]
    }
  ]);

  const handleAddColor = () => {
    setProdColors((prev) => [
      ...prev,
      {
        name: `Color ${prev.length + 1}`,
        hex: '#433022',
        stock: prodInventoryType === 'single' ? 25 : 35,
        sizes:
          prodInventoryType === 'single'
            ? [{ size: 'ONE_SIZE', stock: 25 }]
            : [
                { size: 'M', chest: '40', length: '28', stock: 10 },
                { size: 'L', chest: '42', length: '29', stock: 12 },
                { size: 'XL', chest: '44', length: '30', stock: 8 },
                { size: 'XXL', chest: '46', length: '31', stock: 5 }
              ]
      }
    ]);
  };

  const handleRemoveColor = (idx) => {
    if (prodColors.length <= 1) {
      notify('At least one color variant is required for every product.');
      return;
    }
    setProdColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateColorField = (idx, field, val) => {
    setProdColors((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleUpdateColorSizeStock = (colorIdx, sizeName, newStock) => {
    const val = Math.max(0, Number(newStock) || 0);
    setProdColors((prev) => {
      const copy = [...prev];
      const target = { ...copy[colorIdx] };
      const sizesCopy = (target.sizes || []).map((s) =>
        s.size === sizeName ? { ...s, stock: val } : s
      );
      target.sizes = sizesCopy;
      target.stock = sizesCopy.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
      copy[colorIdx] = target;
      return copy;
    });
  };

  const handleUpdateColorSingleStock = (colorIdx, newStock) => {
    const val = Math.max(0, Number(newStock) || 0);
    setProdColors((prev) => {
      const copy = [...prev];
      const target = { ...copy[colorIdx] };
      target.stock = val;
      target.sizes = [{ size: 'ONE_SIZE', stock: val }];
      copy[colorIdx] = target;
      return copy;
    });
  };

  const handleCopySizesToAllColors = (sourceIdx) => {
    const sourceSizes = prodColors[sourceIdx]?.sizes;
    if (!sourceSizes || sourceSizes.length === 0) return;
    setProdColors((prev) =>
      prev.map((c, i) => {
        if (i === sourceIdx) return c;
        const newSizes = JSON.parse(JSON.stringify(sourceSizes));
        const newStock = newSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
        return {
          ...c,
          sizes: newSizes,
          stock: newStock
        };
      })
    );
    notify(`Copied size breakdown from "${prodColors[sourceIdx].name}" to all other colors!`);
  };

  const handleAddPhotoSlot = () => setProdAdditionalImgs((prev) => [...prev, '']);
  const handleUpdatePhotoSlot = (index, url) =>
    setProdAdditionalImgs((prev) => {
      const copy = [...prev];
      copy[index] = url;
      return copy;
    });
  const handleRemovePhotoSlot = (index) =>
    setProdAdditionalImgs((prev) => prev.filter((_, i) => i !== index));

  // --- Category Form State ---
  const [catName, setCatName] = useState('');
  const [catCardImg, setCatCardImg] = useState('');
  const [catBannerImg, setCatBannerImg] = useState('');
  const [catSortOrder, setCatSortOrder] = useState('1');
  const [catIsActive, setCatIsActive] = useState(true);

  // --- Hero Slide Form State ---
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBadge, setHeroBadge] = useState('NEW SEASON 2026');
  const [heroCtaText, setHeroCtaText] = useState('EXPLORE COLLECTION');
  const [heroLinkUrl, setHeroLinkUrl] = useState('#catalog-section');
  const [heroImgUrl, setHeroImgUrl] = useState('');
  const [heroSortOrder, setHeroSortOrder] = useState('1');
  const [heroIsActive, setHeroIsActive] = useState(true);

  // --- Promo Layout Block Form State ---
  const [promoType, setPromoType] = useState('bento_large');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoSubtitle, setPromoSubtitle] = useState('');
  const [promoBadge, setPromoBadge] = useState('');
  const [promoCatSlug, setPromoCatSlug] = useState('');
  const [promoImgUrl, setPromoImgUrl] = useState('');
  const [promoSortOrder, setPromoSortOrder] = useState('1');
  const [promoIsActive, setPromoIsActive] = useState(true);

  const notify = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 4500);
  };

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [prodRes, ordRes, banRes, invRes] = await Promise.all([
        fetch('/api/products?admin=true'),
        fetch('/api/orders'),
        fetch('/api/banners?admin=true'),
        fetch('/api/inventory')
      ]);

      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const banData = await banRes.json();
      const invData = await invRes.json();

      setProducts(prodData.products || []);
      setOrders(ordData.orders || []);
      setCategories(prodData.categories || []);
      setHeroSlides(banData.heroSlides || []);
      setPromoBlocks(banData.promoBlocks || []);

      if (invData.summary) {
        setInventorySummary(invData.summary);
      }
      if (invData.recentLogs) {
        setInventoryLogs(invData.recentLogs);
      }

      if (prodData.categories && prodData.categories.length > 0 && !prodCatSlug) {
        setProdCatSlug(prodData.categories[0].slug);
        setPromoCatSlug(prodData.categories[0].slug);
      }
    } catch (e) {
      console.error('loadAll error:', e);
      notify('Failed to load data: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          loadAll();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message || 'Invalid username or password.');
        return;
      }
      setIsAuthenticated(true);
      loadAll();
    } catch {
      setLoginError('Authentication failed. Check your connection.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch {}
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (categories.length > 0 && !prodCatSlug) {
      setProdCatSlug(categories[0].slug);
    }
    if (categories.length > 0 && !promoCatSlug) {
      setPromoCatSlug(categories[0].slug);
    }
  }, [categories]);

  // ========================================================
  // 1. INVENTORY HUB ACTIONS (1-Click Restock, Edit, Factory CSV)
  // ========================================================
  const handleQuickRestock = async (productId, color, size, changeAmount, reason = 'manual_restock') => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick_adjust',
          productId,
          color,
          size,
          changeAmount,
          reason
        })
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Restocked +${changeAmount} unit(s) for SKU ${data.product?.sku || ''} [${color || 'All'} • ${size}] (Total: ${data.product?.totalStock})`);
        await loadAll();
      } else {
        notify('Restock error: ' + (data.message || 'Failed'));
      }
    } catch (err) {
      notify('Restock error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProductStock = async (e) => {
    e.preventDefault();
    if (!stockEditModal) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_stock',
          productId: stockEditModal.id,
          totalStock: stockEditModal.totalStock,
          colors: stockEditModal.colors,
          sizes: stockEditModal.sizes,
          lowStockThreshold: stockEditModal.lowStockThreshold,
          inventoryType: stockEditModal.inventoryType
        })
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Stock updated successfully for SKU ${data.product?.sku || ''}`);
        setStockEditModal(null);
        await loadAll();
      } else {
        notify('Stock update error: ' + (data.message || 'Failed'));
      }
    } catch (err) {
      notify('Stock update error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFactoryReorderSheet = () => {
    const reorderItems = [];

    products.forEach((p) => {
      const isSingle = p.inventoryType === 'single';
      const threshold = Number(p.lowStockThreshold) || 5;
      const colors = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [];

      if (colors.length > 0) {
        colors.forEach((c) => {
          if (isSingle || !c.sizes || c.sizes.length === 0) {
            const cStock = Number(c.stock) || 0;
            if (cStock <= threshold) {
              reorderItems.push({
                sku: p.sku,
                name: p.name,
                category: p.category,
                type: 'Universal Spec / Accessory',
                color: c.name,
                variant: 'ONE_SIZE',
                currentStock: cStock,
                threshold,
                status: cStock <= 0 ? 'CRITICAL - SOLD OUT' : 'LOW STOCK WARNING',
                recommendedBatch: Math.max(25, threshold * 3 - cStock)
              });
            }
          } else {
            c.sizes.forEach((s) => {
              const stock = Number(s.stock) || 0;
              if (stock <= threshold) {
                reorderItems.push({
                  sku: p.sku,
                  name: p.name,
                  category: p.category,
                  type: 'Sized Apparel',
                  color: c.name,
                  variant: s.size,
                  currentStock: stock,
                  threshold,
                  status: stock <= 0 ? 'DEPLETED - SOLD OUT' : 'LOW STOCK',
                  recommendedBatch: Math.max(15, threshold * 3 - stock)
                });
              }
            });
          }
        });
      } else {
        // Fallback for flat sizes or single without colors
        const sizes = Array.isArray(p.sizes) ? p.sizes : [];
        if (isSingle || sizes.length === 0) {
          if (p.totalStock <= threshold) {
            reorderItems.push({
              sku: p.sku,
              name: p.name,
              category: p.category,
              type: 'Universal Spec / Accessory',
              color: 'Standard',
              variant: 'ONE_SIZE',
              currentStock: p.totalStock,
              threshold,
              status: p.totalStock <= 0 ? 'CRITICAL - SOLD OUT' : 'LOW STOCK WARNING',
              recommendedBatch: Math.max(25, threshold * 3 - p.totalStock)
            });
          }
        } else {
          sizes.forEach((s) => {
            const stock = Number(s.stock) || 0;
            if (stock <= threshold) {
              reorderItems.push({
                sku: p.sku,
                name: p.name,
                category: p.category,
                type: 'Sized Apparel',
                color: 'Standard',
                variant: s.size,
                currentStock: stock,
                threshold,
                status: stock <= 0 ? 'DEPLETED - SOLD OUT' : 'LOW STOCK',
                recommendedBatch: Math.max(15, threshold * 3 - stock)
              });
            }
          });
        }
      }
    });

    if (reorderItems.length === 0) {
      notify('All inventory is healthy! No factory reorders currently required.');
      return;
    }

    const headers = [
      'SKU',
      'Garment / Item Name',
      'Category',
      'Inventory Model',
      'Colour Variant',
      'Size / Variant',
      'Current On-Hand Stock',
      'Alert Threshold',
      'Urgency Status',
      'Recommended Factory Production Order'
    ];

    const rows = reorderItems.map((r) => [
      `"${r.sku}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.type}"`,
      `"${r.color}"`,
      `"${r.variant}"`,
      r.currentStock,
      r.threshold,
      `"${r.status}"`,
      r.recommendedBatch
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Vincent_Vintage_Factory_Reorder_Sheet_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify(`Factory Reorder Sheet exported with ${reorderItems.length} lines.`);
  };

  // ========================================================
  // 2. PRODUCT ACTIONS & CHECKBOX TOGGLES
  // ========================================================
  const handleToggleProduct = async (id, currentActive, name) => {
    const nextVal = !currentActive;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextVal } : p))
    );
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: nextVal })
      });
      if (res.ok) {
        notify(`Product "${name}" is now ${nextVal ? 'VISIBLE' : 'HIDDEN'} on store.`);
      } else {
        notify('Failed to update product visibility.');
        loadAll();
      }
    } catch {
      loadAll();
    }
  };

  const handleToggleProductFlag = async (id, flagName, currentVal) => {
    const nextVal = !currentVal;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [flagName]: nextVal } : p))
    );
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [flagName]: nextVal })
      });
      if (res.ok) {
        notify(`Updated ${flagName} to ${nextVal ? 'ON' : 'OFF'}.`);
      } else {
        notify('Failed to update badge.');
        loadAll();
      }
    } catch {
      loadAll();
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodSku || !prodPrimaryImg) {
      notify('Please fill in Product Name, SKU, and Primary Image.');
      return;
    }
    const galleryList = [prodPrimaryImg, prodHoverImg, ...prodAdditionalImgs].filter(Boolean);

    // Calculate total stock across all colors and their sizes
    const calculatedTotalStock = prodColors.reduce((sum, c) => {
      if (prodInventoryType === 'single') {
        return sum + (Number(c.stock) || 0);
      }
      return sum + (c.sizes || []).reduce((sSum, s) => sSum + (Number(s.stock) || 0), 0);
    }, 0);

    // Rollup aggregate sizes across all colors
    const sizeRollupMap = {};
    prodColors.forEach((c) => {
      (c.sizes || []).forEach((s) => {
        if (!sizeRollupMap[s.size]) {
          sizeRollupMap[s.size] = { size: s.size, stock: 0, chest: s.chest || '42', length: s.length || '29' };
        }
        sizeRollupMap[s.size].stock += Number(s.stock) || 0;
      });
    });
    const aggregateSizes = Object.values(sizeRollupMap);

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: prodName,
        sku: prodSku,
        categorySlug: prodCatSlug,
        regularPrice: Number(prodRegPrice),
        salePrice: Number(prodSalePrice),
        fabric: prodFabric,
        primaryImage: prodPrimaryImg,
        hoverImage: prodHoverImg || prodPrimaryImg,
        gallery: galleryList,
        description: prodDesc,
        isActive: prodIsActive,
        isBestSeller: prodIsBestSeller,
        isNewArrival: prodIsNewArrival,
        isTodaysDeal: prodIsTodaysDeal,
        inventoryType: prodInventoryType,
        totalStock: calculatedTotalStock,
        lowStockThreshold: Number(prodLowStockThreshold) || 5,
        colors: prodColors,
        sizes: aggregateSizes
      })
    });

    if (res.ok) {
      notify('New SKU published directly to Neon database with real-time inventory tracking!');
      setProdName('');
      setProdSku('');
      setProdPrimaryImg('');
      setProdHoverImg('');
      setProdAdditionalImgs([]);
      setProdFabric('');
      setProdDesc('');
      setProdColors([
        {
          name: 'Ivory Cream',
          hex: '#F4F1EA',
          stock: 35,
          sizes: [
            { size: 'M', chest: '40', length: '28', stock: 10 },
            { size: 'L', chest: '42', length: '29', stock: 12 },
            { size: 'XL', chest: '44', length: '30', stock: 8 },
            { size: 'XXL', chest: '46', length: '31', stock: 5 }
          ]
        },
        {
          name: 'Sage Olive',
          hex: '#6B7A66',
          stock: 28,
          sizes: [
            { size: 'M', chest: '40', length: '28', stock: 8 },
            { size: 'L', chest: '42', length: '29', stock: 10 },
            { size: 'XL', chest: '44', length: '30', stock: 6 },
            { size: 'XXL', chest: '46', length: '31', stock: 4 }
          ]
        }
      ]);
      loadAll();
      setTab('inventory');
    } else {
      const data = await res.json();
      notify('Error: ' + (data.message || 'Failed to create product'));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (
      !confirm(
        'Are you sure you want to permanently delete this product SKU? (Tip: You can simply uncheck the checkbox to hide it without deleting!)'
      )
    )
      return;
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    notify('Product deleted from database.');
    loadAll();
  };

  // ========================================================
  // 3. CATEGORY ACTIONS & CHECKBOX TOGGLES
  // ========================================================
  const handleToggleCategory = async (id, currentActive, name) => {
    const nextVal = !currentActive;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: nextVal } : c))
    );
    try {
      const res = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: nextVal })
      });
      if (res.ok) {
        notify(
          `Category "${name}" ${
            nextVal
              ? 'ENABLED (Showing in navigation and catalog)'
              : 'HIDDEN (Hidden from store navigation without deleting!)'
          }`
        );
      } else {
        notify('Failed to update category visibility.');
        loadAll();
      }
    } catch {
      loadAll();
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName || !catCardImg) {
      notify('Please enter Category Name and Card Image URL.');
      return;
    }
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: catName,
        cardImage: catCardImg,
        bannerImage: catBannerImg || catCardImg,
        sortOrder: Number(catSortOrder) || 0,
        isActive: catIsActive
      })
    });
    if (res.ok) {
      notify(`Category "${catName}" created and published!`);
      setCatName('');
      setCatCardImg('');
      setCatBannerImg('');
      loadAll();
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (
      !confirm(
        `Permanently delete category "${name}"? (Tip: Unchecking the checkbox hides it safely without breaking existing orders or deleting items!)`
      )
    )
      return;
    await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    notify(`Category "${name}" deleted.`);
    loadAll();
  };

  // ========================================================
  // 4. HERO SLIDER ACTIONS & CHECKBOX TOGGLES
  // ========================================================
  const handleToggleHeroSlide = async (id, currentActive, title) => {
    const nextVal = !currentActive;
    setHeroSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: nextVal } : s))
    );
    try {
      const res = await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'hero', id, isActive: nextVal })
      });
      if (res.ok) {
        notify(`Hero slide "${title}" is now ${nextVal ? 'ACTIVE' : 'PAUSED'}.`);
      } else {
        notify('Failed to update hero slide.');
        loadAll();
      }
    } catch {
      loadAll();
    }
  };

  const handleCreateHeroSlide = async (e) => {
    e.preventDefault();
    if (!heroTitle || !heroImgUrl) {
      notify('Title and Image URL are required for Hero Slide.');
      return;
    }
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'hero',
        title: heroTitle,
        subtitle: heroSubtitle,
        badge: heroBadge,
        ctaText: heroCtaText,
        linkUrl: heroLinkUrl,
        imageUrl: heroImgUrl,
        sortOrder: Number(heroSortOrder) || 0,
        isActive: heroIsActive
      })
    });
    if (res.ok) {
      notify('New Hero Slide published to homepage carousel!');
      setHeroTitle('');
      setHeroSubtitle('');
      setHeroImgUrl('');
      loadAll();
    }
  };

  const handleDeleteHeroSlide = async (id) => {
    if (!confirm('Permanently delete this hero banner slide?')) return;
    await fetch(`/api/banners?type=hero&id=${id}`, { method: 'DELETE' });
    notify('Hero slide removed.');
    loadAll();
  };

  // ========================================================
  // 5. PROMO LAYOUT BLOCKS & CHECKBOX TOGGLES
  // ========================================================
  const handleTogglePromoBlock = async (id, currentActive, title) => {
    const nextVal = !currentActive;
    setPromoBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: nextVal } : b))
    );
    try {
      const res = await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'promo', id, isActive: nextVal })
      });
      if (res.ok) {
        notify(`Promo block "${title}" is now ${nextVal ? 'ACTIVE on homepage' : 'HIDDEN'}.`);
      } else {
        notify('Failed to update block.');
        loadAll();
      }
    } catch {
      loadAll();
    }
  };

  const handleCreatePromoBlock = async (e) => {
    e.preventDefault();
    if (!promoTitle || !promoImgUrl) {
      notify('Promo block Title and Image URL are required.');
      return;
    }
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'promo',
        blockType: promoType,
        title: promoTitle,
        subtitle: promoSubtitle,
        badge: promoBadge,
        categorySlug: promoCatSlug,
        imageUrl: promoImgUrl,
        sortOrder: Number(promoSortOrder) || 0,
        isActive: promoIsActive
      })
    });
    if (res.ok) {
      notify('New promotional block added to homepage grid!');
      setPromoTitle('');
      setPromoSubtitle('');
      setPromoImgUrl('');
      loadAll();
    }
  };

  const handleDeletePromoBlock = async (id) => {
    if (!confirm('Permanently delete this promotional layout block?')) return;
    await fetch(`/api/banners?type=promo&id=${id}`, { method: 'DELETE' });
    notify('Promo block removed.');
    loadAll();
  };

  // ========================================================
  // 6. ORDER ACTIONS (Status Updates with Auto-Restock on Cancel)
  // ========================================================
  const handleStatusChange = async (id, status) => {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    notify(
      `Order status updated to ${status.toUpperCase()}${
        status === 'cancelled' ? ' (Stock restored to Neon inventory automatically!)' : ''
      }`
    );
    loadAll();
  };

  // Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const activeProductsCount = products.filter((p) => p.isActive !== false).length;
  const activeCategoriesCount = categories.filter((c) => c.isActive !== false).length;

  // Filtered Products for Catalog Table
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'all' || p.categorySlug === productCatFilter;
    const matchesVis =
      productVisibilityFilter === 'all' ||
      (productVisibilityFilter === 'active' && p.isActive !== false) ||
      (productVisibilityFilter === 'hidden' && p.isActive === false);
    return matchesSearch && matchesCat && matchesVis;
  });

  // Filtered Products for Inventory Hub
  const filteredInventoryProducts = products.filter((p) => {
    const matchesSearch =
      !inventorySearch ||
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCat = inventoryCatFilter === 'all' || p.categorySlug === inventoryCatFilter;

    const total = Number(p.totalStock !== undefined ? p.totalStock : 0);
    const thresh = Number(p.lowStockThreshold) || 5;

    let matchesStock = true;
    if (inventoryStockFilter === 'sold_out') {
      matchesStock = total <= 0;
    } else if (inventoryStockFilter === 'low_stock') {
      matchesStock = total > 0 && total <= thresh;
    } else if (inventoryStockFilter === 'healthy') {
      matchesStock = total > thresh;
    }

    return matchesSearch && matchesCat && matchesStock;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (!orderSearch) return true;
    const q = orderSearch.toLowerCase();
    return (
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q))
    );
  });

  // Group distinct clients / customers from orders ledger
  const uniqueCustomers = React.useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = (o.customerPhone || '').replace(/\D/g, '') || (o.customerName || '').trim() || String(o.id);
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: o.customerName || 'Guest Client',
          phone: o.customerPhone || 'N/A',
          email: o.customerEmail || '',
          address: o.shippingAddress || '',
          deliveryZone: o.deliveryZone || 'Inside Dhaka',
          ordersCount: 1,
          totalSpent: Number(o.totalAmount) || 0,
          lastOrderDate: o.createdAt,
          lastOrderNumber: o.orderNumber,
          lastStatus: o.status
        });
      } else {
        const c = map.get(key);
        c.ordersCount += 1;
        c.totalSpent += Number(o.totalAmount) || 0;
        if (new Date(o.createdAt) > new Date(c.lastOrderDate)) {
          c.lastOrderDate = o.createdAt;
          c.lastOrderNumber = o.orderNumber;
          c.lastStatus = o.status;
          c.address = o.shippingAddress || c.address;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
  }, [orders]);

  const filteredCustomers = uniqueCustomers.filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f6f3eb] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#a8825b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display uppercase tracking-widest text-xs font-bold text-[#6e5d52]">
            Verifying Atelier Security Clearance...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f6f3eb] flex items-center justify-center p-4 sm:p-6 text-[#3d2b1f]">
        <div className="w-full max-w-md bg-[#fcfbf7] border border-[#e3ded3] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Dark Mocha & Gold Crest */}
          <div className="bg-[#4e3828] text-white p-6 sm:p-8 text-center relative">
            <div className="inline-flex p-3 rounded-2xl bg-[#fcfbf7] shadow-md mb-3">
              <img src="/brand/logo.png" alt="Vincent & Vintage" className="h-12 w-auto crisp-logo" />
            </div>
            <h2 className="font-display uppercase tracking-widest text-lg sm:text-xl font-bold text-[#f4b66b]">
              Atelier Staff Portal
            </h2>
            <p className="text-xs text-[#ede8dc]/80 mt-1 font-body">
              Restricted Administrative &amp; Inventory Hub
            </p>
            <div className="absolute top-4 right-4 text-[#c59f72]/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-display font-semibold p-3.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] mb-1.5">
                Staff Username
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="admin"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-xl px-4 py-3 text-base text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] mb-1.5">
                Secret Passcode
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-xl px-4 py-3 text-base text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4e3828] via-[#473224] to-[#38251a] hover:from-[#432f22] hover:to-[#301f15] text-[#fbf9f5] border border-[#c59f72]/50 font-display uppercase tracking-[0.18em] text-sm font-bold shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#f4b66b]" />
              ) : (
                <Lock className="w-4 h-4 text-[#f4b66b]" />
              )}
              <span>{loginSubmitting ? 'Authenticating...' : 'Authorize Access'}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-[#878278] hover:text-[#4e3828] font-display uppercase tracking-wider transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Public Storefront
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#3d2b1f]">
      {/* ========================================================
          EXECUTIVE ADMIN HEADER (Matte Charcoal & Champagne Gold)
          ======================================================== */}
      <header className="bg-[#4e3828] text-[#f6f3eb] px-6 sm:px-10 py-4 border-b border-[#3e2a1f] sticky top-0 z-40 shadow-md">
        <div className="max-w-[1550px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-[#fcfbf7] p-1.5 rounded-lg inline-flex items-center">
              <img
                src="/brand/logo.png"
                alt="Vincent & Vintage"
                className="h-10 sm:h-12 w-auto crisp-logo"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-lg sm:text-xl uppercase tracking-wider font-bold text-white">
                  Vincent &amp; Vintage
                </h1>
                <span className="bg-[#c59f72]/20 border border-[#c59f72] text-[#f4b66b] text-[11px] font-display uppercase tracking-widest px-2.5 py-0.5 rounded-md font-semibold">
                  Modular CMS &amp; Inventory Hub
                </span>
              </div>
              <p className="text-xs text-[#a0998f] mt-0.5">
                Neon Serverless DB (Singapore) • Cloudinary Edge CDN • Automated Real-Time Stock Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAll}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 bg-[#2a2622] hover:bg-[#38332e] text-[#e3ded3] px-3.5 py-2 rounded-lg text-xs font-display uppercase tracking-wider transition-colors cursor-pointer border border-[#3e2a1f]"
              title="Refresh all data from Neon DB"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#a8825b] to-[#c59f72] hover:from-[#b58e5e] hover:to-[#d0a876] text-white px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider font-bold transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-800/50 px-3.5 py-2 rounded-lg text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer shadow-sm"
              title="Sign out of Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-8 py-8">
        {/* Toast Alert */}
        {msg && (
          <div className="mb-6 bg-[#fcfbf7] text-[#3d2b1f] border-l-4 border-[#a8825b] px-5 py-3.5 rounded-xl flex items-center justify-between gap-3 text-sm font-display font-semibold shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#a8825b] shrink-0" />
              <span>{msg}</span>
            </div>
            <button onClick={() => setMsg('')} className="text-xs text-gray-400 hover:text-[#3d2b1f]">
              Dismiss
            </button>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            KPI SUMMARY STATS CARDS (Dynamic Neon Inventory Values)
            ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
          <div className="bg-[#fcfbf7] p-4 sm:p-5 rounded-2xl border border-[#e3ded3] shadow-xs">
            <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">
              Warehouse Total Units
            </span>
            <p className="text-2xl sm:text-3xl font-display font-bold text-[#3d2b1f] mt-1.5">
              {inventorySummary.totalUnits.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#878278] mt-1">Across {products.length} Active SKUs</p>
          </div>

          <div className="bg-[#fcfbf7] p-4 sm:p-5 rounded-2xl border border-[#e3ded3] shadow-xs">
            <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">
              Healthy In-Stock SKUs
            </span>
            <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-700 mt-1.5">
              {inventorySummary.inStockCount}{' '}
              <span className="text-sm font-normal text-gray-500">/ {products.length}</span>
            </p>
            <p className="text-[11px] text-emerald-800 mt-1">Stock above threshold (&gt; 5)</p>
          </div>

          <div
            onClick={() => {
              setTab('inventory');
              setInventoryStockFilter('low_stock');
            }}
            className="bg-[#fcfbf7] p-4 sm:p-5 rounded-2xl border border-amber-300 shadow-xs hover:border-amber-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-display uppercase tracking-wider text-amber-800 font-bold">
                Low Stock Warnings
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-bold text-amber-700 mt-1.5">
              {inventorySummary.lowStockCount}
            </p>
            <p className="text-[11px] text-amber-800 mt-1">Stock &le; 5 units (Reorder now)</p>
          </div>

          <div
            onClick={() => {
              setTab('inventory');
              setInventoryStockFilter('sold_out');
            }}
            className="bg-[#fcfbf7] p-4 sm:p-5 rounded-2xl border border-rose-300 shadow-xs hover:border-rose-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-display uppercase tracking-wider text-rose-800 font-bold">
                Sold Out SKUs
              </span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-bold text-rose-700 mt-1.5">
              {inventorySummary.soldOutCount}
            </p>
            <p className="text-[11px] text-rose-800 mt-1">0 units remaining (Ordering locked)</p>
          </div>

          <div className="bg-[#fcfbf7] p-4 sm:p-5 rounded-2xl border border-[#e3ded3] shadow-xs col-span-2 lg:col-span-1">
            <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">
              Estimated Inventory Value
            </span>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#a8825b] mt-1.5">
              ৳ {inventorySummary.estimatedValue.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#878278] mt-1">Retail Valuation in Hand</p>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS
            ======================================================== */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8 border-b border-[#e3ded3] pb-4">
          {[
            { id: 'inventory', label: `Inventory Hub (${products.length})`, icon: Boxes },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'customers', label: `Customers (${uniqueCustomers.length})`, icon: Users },
            { id: 'products', label: `Clothing Catalog (${products.length})`, icon: LayoutDashboard },
            { id: 'add-product', label: '+ New Apparel / Accessory SKU', icon: PackagePlus },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'hero', label: `Hero Slider (${heroSlides.length})`, icon: ImageIcon },
            { id: 'layout', label: `Promo Blocks (${promoBlocks.length})`, icon: Grid },
            { id: 'media', label: 'Cloudinary CDN Hub', icon: Cloud }
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-display uppercase tracking-wider font-bold cursor-pointer transition-all ${
                  active
                    ? 'bg-[#4e3828] text-[#f4b66b] shadow-sm'
                    : 'bg-[#fcfbf7] text-[#6e5d52] border border-[#e3ded3] hover:text-[#3d2b1f] hover:border-[#a8825b]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB: INVENTORY HUB (Fast Matrix Table, 1-Click Restocker, Factory Export)
            ======================================================== */}
        {tab === 'inventory' && (
          <div className="space-y-8">
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
              {/* Header & Filter Controls */}
              <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Boxes className="w-5 h-5 text-[#a8825b]" />
                    <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f]">
                      Automated Inventory Management Hub
                    </h2>
                  </div>
                  <p className="text-xs text-[#6e5d52] mt-0.5">
                    Real-time stock ledger powered by Neon PostgreSQL. Click 1-click restock pills or export factory reorders.
                  </p>
                </div>

                {/* Filters & Factory Export */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search SKU or Name..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                    />
                  </div>

                  {/* Stock Status Filter */}
                  <select
                    value={inventoryStockFilter}
                    onChange={(e) => setInventoryStockFilter(e.target.value)}
                    className="bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl px-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b] font-semibold"
                  >
                    <option value="all">All Stock Levels ({products.length})</option>
                    <option value="low_stock">⚠️ Low Stock Warnings ({inventorySummary.lowStockCount})</option>
                    <option value="sold_out">⛔ Sold Out Only ({inventorySummary.soldOutCount})</option>
                    <option value="healthy">✅ Healthy Stock ({inventorySummary.inStockCount})</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={inventoryCatFilter}
                    onChange={(e) => setInventoryCatFilter(e.target.value)}
                    className="bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl px-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                  >
                    <option value="all">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Factory Reorder Export */}
                  <button
                    onClick={handleExportFactoryReorderSheet}
                    className="inline-flex items-center gap-1.5 bg-[#a8825b] hover:bg-[#8e6d49] text-white px-4 py-2 rounded-xl text-xs font-display uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer"
                    title="Export clean CSV for tailoring factory replenishment"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Factory Reorder CSV</span>
                  </button>
                </div>
              </div>

              {/* Fast Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                    <tr>
                      <th className="py-3 px-4">Garment / Item</th>
                      <th className="py-3 px-4">Inventory Model</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Total Units</th>
                      <th className="py-3 px-4">Stock Breakdown &amp; 1-Click Restock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3ded3]">
                    {filteredInventoryProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-500">
                          No products match the selected inventory filter.
                        </td>
                      </tr>
                    ) : (
                      filteredInventoryProducts.map((p) => {
                        const total = Number(p.totalStock !== undefined ? p.totalStock : 0);
                        const thresh = Number(p.lowStockThreshold) || 5;
                        const isSoldOut = total <= 0;
                        const isLow = total > 0 && total <= thresh;
                        const isSingle = p.inventoryType === 'single' || !p.sizes || p.sizes.length === 0;

                        // Standardize colors array with hierarchical sizes: Product -> Colour -> Sizes
                        const pColors = Array.isArray(p.colors) && p.colors.length > 0
                          ? p.colors
                          : [{ name: 'Standard', hex: '#212121', stock: total, sizes: p.sizes || [] }];

                        // Active targeted variant for quick restock
                        const activeTarget = quickRestockTargetMap[p.id] || {
                          color: pColors[0]?.name || 'Standard',
                          size: isSingle ? 'ONE_SIZE' : pColors[0]?.sizes?.[0]?.size || 'M'
                        };

                        return (
                          <tr key={p.id} className="hover:bg-[#f6f3eb] transition-colors">
                            {/* Product Thumb & SKU */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.primaryImage}
                                  alt={p.name}
                                  className="w-12 h-14 object-cover rounded-lg border border-[#e3ded3] bg-[#ede8dc] shrink-0"
                                />
                                <div>
                                  <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f] line-clamp-1 max-w-[220px]">
                                    {p.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[11px] text-[#878278]">{p.sku}</span>
                                    <span className="text-[10px] uppercase font-display px-2 py-0.5 rounded bg-[#ede8dc] text-[#6e5d52]">
                                      {p.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Inventory Model */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[11px] font-display uppercase tracking-wider px-2.5 py-1 rounded-md font-semibold border ${
                                  isSingle
                                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                                    : 'bg-blue-50 text-blue-900 border-blue-200'
                                }`}
                              >
                                {isSingle ? 'Universal Spec' : 'Sized Apparel'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              {isSoldOut ? (
                                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-display uppercase tracking-wider font-bold px-2.5 py-1 rounded-full">
                                  <span>SOLD OUT</span>
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-display uppercase tracking-wider font-bold px-2.5 py-1 rounded-full animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>LOW ({total})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-display uppercase tracking-wider font-bold px-2.5 py-1 rounded-full">
                                  <span>HEALTHY</span>
                                </span>
                              )}
                            </td>

                            {/* Total Units */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="font-display">
                                <span className="font-bold text-base sm:text-lg text-[#3d2b1f]">
                                  {total}
                                </span>
                                <span className="text-[10px] text-gray-500 block">
                                  Alert &le; {thresh}
                                </span>
                              </div>
                            </td>

                            {/* Hierarchical Colour -> Size Matrix & 1-Click Restock */}
                            <td className="py-3.5 px-4 min-w-[340px]">
                              <div className="space-y-2.5">
                                {pColors.map((c) => {
                                  const cStock = Number(c.stock) || 0;
                                  const cSizes = Array.isArray(c.sizes) ? c.sizes : [];

                                  return (
                                    <div
                                      key={c.name}
                                      className="p-2.5 rounded-xl bg-[#ede8dc]/50 border border-[#e3ded3] space-y-1.5"
                                    >
                                      {/* Color Header & Total */}
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className="w-3.5 h-3.5 rounded-full inline-block border border-[#4e3828]/20 shadow-2xs shrink-0"
                                            style={{ backgroundColor: c.hex || '#212121' }}
                                          />
                                          <span className="font-display font-bold text-xs uppercase tracking-wider text-[#3d2b1f]">
                                            {c.name}
                                          </span>
                                        </div>
                                        <span className="font-mono text-[11px] font-bold text-[#6e5d52] bg-[#fcfbf7] px-2 py-0.5 rounded-md border border-[#e3ded3]">
                                          {cStock} units
                                        </span>
                                      </div>

                                      {isSingle || cSizes.length === 0 ? (
                                        /* Single Unit Quick Restock */
                                        <div className="flex items-center justify-between pt-1">
                                          <span className="text-[11px] text-[#6e5d52]">Quick Restock:</span>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleQuickRestock(p.id, c.name, 'ONE_SIZE', 5)}
                                              disabled={isLoading}
                                              className="text-xs bg-[#fcfbf7] hover:bg-[#4e3828] hover:text-[#f4b66b] text-[#3d2b1f] border border-[#e3ded3] px-2 py-0.5 rounded-md font-display font-bold transition-all cursor-pointer shadow-2xs"
                                              title={`Add +5 units to ${c.name}`}
                                            >
                                              +5
                                            </button>
                                            <button
                                              onClick={() => handleQuickRestock(p.id, c.name, 'ONE_SIZE', 10)}
                                              disabled={isLoading}
                                              className="text-xs bg-[#fcfbf7] hover:bg-[#4e3828] hover:text-[#f4b66b] text-[#3d2b1f] border border-[#e3ded3] px-2 py-0.5 rounded-md font-display font-bold transition-all cursor-pointer shadow-2xs"
                                              title={`Add +10 units to ${c.name}`}
                                            >
                                              +10
                                            </button>
                                            <button
                                              onClick={() => handleQuickRestock(p.id, c.name, 'ONE_SIZE', 25)}
                                              disabled={isLoading}
                                              className="text-xs bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white px-2 py-0.5 rounded-md font-display font-bold transition-all cursor-pointer shadow-2xs"
                                              title={`Add +25 units to ${c.name}`}
                                            >
                                              +25
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        /* Sized Apparel Hierarchy: Colour -> Sizes */
                                        <div className="space-y-1.5 pt-0.5">
                                          <div className="flex flex-wrap gap-1.5">
                                            {cSizes.map((s) => {
                                              const sStock = Number(s.stock) || 0;
                                              const isSizeOut = sStock <= 0;
                                              const isSizeLow = sStock > 0 && sStock <= thresh;
                                              const isTargeted =
                                                activeTarget.color === c.name && activeTarget.size === s.size;

                                              return (
                                                <button
                                                  key={s.size}
                                                  onClick={() =>
                                                    setQuickRestockTargetMap((prev) => ({
                                                      ...prev,
                                                      [p.id]: { color: c.name, size: s.size }
                                                    }))
                                                  }
                                                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono border transition-all cursor-pointer flex items-center gap-1 ${
                                                    isTargeted
                                                      ? 'bg-[#4e3828] text-white border-[#4e3828] ring-2 ring-[#a8825b]'
                                                      : isSizeOut
                                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                      : isSizeLow
                                                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                                                      : 'bg-[#fcfbf7] text-[#3d2b1f] border-[#e3ded3]'
                                                  }`}
                                                  title={`Click to target ${c.name} • Size ${s.size} for restock`}
                                                >
                                                  <span className="font-bold">{s.size}:</span>
                                                  <span className={isSizeOut ? 'text-red-700 font-bold' : ''}>
                                                    {sStock}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>

                                          {/* Quick Restock controls for targeted variant in this color */}
                                          {activeTarget.color === c.name && (
                                            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#e3ded3]/60 text-xs">
                                              <span className="text-[10px] text-[#6e5d52]">
                                                Restock <strong>{activeTarget.size}</strong>:
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <button
                                                  onClick={() =>
                                                    handleQuickRestock(p.id, c.name, activeTarget.size, 5)
                                                  }
                                                  disabled={isLoading}
                                                  className="text-[11px] bg-[#fcfbf7] hover:bg-[#4e3828] hover:text-[#f4b66b] text-[#3d2b1f] border border-[#e3ded3] px-2 py-0.5 rounded font-display font-bold transition-all cursor-pointer shadow-2xs"
                                                >
                                                  +5
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleQuickRestock(p.id, c.name, activeTarget.size, 10)
                                                  }
                                                  disabled={isLoading}
                                                  className="text-[11px] bg-[#fcfbf7] hover:bg-[#4e3828] hover:text-[#f4b66b] text-[#3d2b1f] border border-[#e3ded3] px-2 py-0.5 rounded font-display font-bold transition-all cursor-pointer shadow-2xs"
                                                >
                                                  +10
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleQuickRestock(p.id, c.name, activeTarget.size, 20)
                                                  }
                                                  disabled={isLoading}
                                                  className="text-[11px] bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white px-2 py-0.5 rounded font-display font-bold transition-all cursor-pointer shadow-2xs"
                                                >
                                                  +20
                                                </button>
                                                <button
                                                  onClick={() => handleQuickRestock(p.id, c.name, 'ALL', 5)}
                                                  disabled={isLoading}
                                                  className="text-[10px] bg-[#ede8dc] hover:bg-[#4e3828] hover:text-[#f4b66b] text-[#6e5d52] border border-[#e3ded3] px-1.5 py-0.5 rounded font-display uppercase tracking-wider font-semibold transition-all cursor-pointer ml-1"
                                                  title="Add +5 units to each size in this color"
                                                >
                                                  +5 all
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() =>
                                  setStockEditModal({
                                    id: p.id,
                                    name: p.name,
                                    sku: p.sku,
                                    inventoryType: p.inventoryType || 'sizes',
                                    totalStock: p.totalStock,
                                    lowStockThreshold: p.lowStockThreshold || 5,
                                    colors: Array.isArray(p.colors) && p.colors.length > 0
                                      ? JSON.parse(JSON.stringify(p.colors))
                                      : [{ name: 'Standard', hex: '#212121', stock: p.totalStock, sizes: p.sizes || [] }],
                                    sizes: Array.isArray(p.sizes) ? JSON.parse(JSON.stringify(p.sizes)) : []
                                  })
                                }
                                className="inline-flex items-center gap-1 bg-[#ede8dc] hover:bg-[#4e3828] hover:text-white text-[#3d2b1f] px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider font-bold transition-colors cursor-pointer border border-[#e3ded3]"
                                title="Open full stock override editor"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Adjust Stock</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================
                RECENT INVENTORY AUDIT TRAIL (Neon inventory_logs)
                ======================================================== */}
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#a8825b]" />
                  <h3 className="font-display font-bold text-base sm:text-lg uppercase tracking-wider text-[#3d2b1f]">
                    Recent Inventory Audit Trail (Neon Database)
                  </h3>
                </div>
                <span className="text-xs text-[#878278]">Showing latest 25 transactions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#ede8dc] uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Colour</th>
                      <th className="py-2.5 px-3">Variant / Size</th>
                      <th className="py-2.5 px-3 text-center">Change</th>
                      <th className="py-2.5 px-3 text-center">Resulting Stock</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Reference / Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3ded3]">
                    {inventoryLogs.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-6 text-center text-gray-500">
                          No inventory audit logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      inventoryLogs.map((log) => {
                        const isPositive = Number(log.change_amount) > 0;
                        return (
                          <tr key={log.id} className="hover:bg-[#f6f3eb]">
                            <td className="py-2.5 px-3 font-mono text-[#6e5d52]">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#3d2b1f]">{log.sku}</td>
                            <td className="py-2.5 px-3 font-display uppercase tracking-wider font-semibold text-[#3d2b1f]">
                              {log.color || 'Standard'}
                            </td>
                            <td className="py-2.5 px-3 font-display uppercase tracking-wider font-semibold">
                              {log.size || 'ONE_SIZE'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`font-mono font-bold px-2 py-0.5 rounded ${
                                  isPositive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isPositive ? `+${log.change_amount}` : log.change_amount}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-[#3d2b1f]">
                              {log.new_stock}
                            </td>
                            <td className="py-2.5 px-3 font-display uppercase tracking-wider text-[#6e5d52]">
                              {log.reason.replace(/_/g, ' ')}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-gray-500">
                              {log.reference_id || '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 1: PRODUCT CATALOG WITH DIRECT CHECKBOX SYSTEM
            ======================================================== */}
        {tab === 'products' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            {/* Header & Filter Controls */}
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f]">
                  Clothing SKU Catalog
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Check or uncheck the boxes below to toggle visibility and badges instantly without deleting data.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl px-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Visibility Filter */}
                <select
                  value={productVisibilityFilter}
                  onChange={(e) => setProductVisibilityFilter(e.target.value)}
                  className="bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl px-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only ({activeProductsCount})</option>
                  <option value="hidden">Hidden Only ({products.length - activeProductsCount})</option>
                </select>

                <button
                  onClick={() => setTab('add-product')}
                  className="inline-flex items-center gap-1.5 bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white px-4 py-2 rounded-xl text-xs font-display uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add SKU</span>
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Garment</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (Sale / Reg)</th>
                    <th className="py-3 px-4 text-center">Live Inventory</th>
                    <th className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1" title="Uncheck to hide without deleting">
                        <span>Show on Store</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">Best Seller</th>
                    <th className="py-3 px-4 text-center">New Arrival</th>
                    <th className="py-3 px-4 text-center">Deal</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-gray-500">
                        No products match your active search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isActive = p.isActive !== false;
                      const total = Number(p.totalStock !== undefined ? p.totalStock : 0);
                      const isSoldOut = total <= 0;
                      const isLow = total > 0 && total <= (p.lowStockThreshold || 5);

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-[#f6f3eb] transition-colors ${
                            !isActive ? 'opacity-60 bg-[#f9f7f2]' : ''
                          }`}
                        >
                          {/* Garment / Image / SKU */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.primaryImage}
                                alt={p.name}
                                className="w-12 h-14 object-cover rounded-lg border border-[#e3ded3] bg-[#ede8dc]"
                              />
                              <div>
                                <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f] line-clamp-1 max-w-[220px]">
                                  {p.name}
                                </p>
                                <span className="font-mono text-[11px] text-[#878278]">{p.sku}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="text-xs uppercase font-display tracking-wider px-2.5 py-1 rounded-md bg-[#ede8dc] text-[#6e5d52] font-semibold">
                              {p.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4">
                            <div className="font-display">
                              <span className="font-bold text-sm text-[#3d2b1f]">
                                ৳ {Number(p.salePrice).toLocaleString()}
                              </span>
                              {p.regularPrice > p.salePrice && (
                                <span className="text-xs text-gray-400 line-through ml-1.5">
                                  ৳ {Number(p.regularPrice).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Live Inventory Status */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setTab('inventory');
                                setInventorySearch(p.sku);
                              }}
                              className="cursor-pointer group/inv inline-block"
                              title="Click to view in Inventory Hub"
                            >
                              <span
                                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                  isSoldOut
                                    ? 'bg-rose-100 text-rose-800'
                                    : isLow
                                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isSoldOut ? 'Sold Out (0)' : isLow ? `Low (${total})` : `${total} units`}
                              </span>
                            </button>
                          </td>

                          {/* Main Visibility Checkbox */}
                          <td className="py-3 px-4 text-center">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleProduct(p.id, isActive, p.name)}
                                className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b] cursor-pointer"
                              />
                              <span
                                className={`text-[11px] font-display uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isActive ? 'Live' : 'Hidden'}
                              </span>
                            </label>
                          </td>

                          {/* Best Seller Checkbox */}
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(p.isBestSeller)}
                              onChange={() =>
                                handleToggleProductFlag(p.id, 'isBestSeller', p.isBestSeller)
                              }
                              className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b] cursor-pointer"
                            />
                          </td>

                          {/* New Arrival Checkbox */}
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(p.isNewArrival)}
                              onChange={() =>
                                handleToggleProductFlag(p.id, 'isNewArrival', p.isNewArrival)
                              }
                              className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b] cursor-pointer"
                            />
                          </td>

                          {/* Deal Checkbox */}
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(p.isTodaysDeal)}
                              onChange={() =>
                                handleToggleProductFlag(p.id, 'isTodaysDeal', p.isTodaysDeal)
                              }
                              className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b] cursor-pointer"
                            />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setStockEditModal({
                                    id: p.id,
                                    name: p.name,
                                    sku: p.sku,
                                    inventoryType: p.inventoryType || 'sizes',
                                    totalStock: p.totalStock,
                                    lowStockThreshold: p.lowStockThreshold || 5,
                                    colors: Array.isArray(p.colors) && p.colors.length > 0
                                      ? JSON.parse(JSON.stringify(p.colors))
                                      : [{ name: 'Standard', hex: '#212121', stock: p.totalStock, sizes: p.sizes || [] }],
                                    sizes: Array.isArray(p.sizes) ? JSON.parse(JSON.stringify(p.sizes)) : []
                                  })
                                }
                                className="p-1.5 text-gray-500 hover:text-[#3d2b1f] hover:bg-[#ede8dc] rounded-lg transition-colors cursor-pointer"
                                title="Edit Stock"
                              >
                                <Boxes className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete SKU"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ADD NEW PRODUCT FORM (Cloudinary Uploads + Inventory Model)
            ======================================================== */}
        {tab === 'add-product' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="border-b border-[#e3ded3] pb-4 mb-6">
              <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#3d2b1f]">
                Publish New Catalog SKU
              </h2>
              <p className="text-xs sm:text-sm text-[#6e5d52] mt-0.5">
                Drop high-resolution photos for clothing, accessories, or leather goods. They upload to Cloudinary and write to Neon automatically with dynamic inventory tracking.
              </p>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                    Product / Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Textured Old Money Cuban Collar Shirt | VV-101"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                    Unique SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VV-101"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm font-mono focus:border-[#a8825b] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                    Category *
                  </label>
                  <select
                    value={prodCatSlug}
                    onChange={(e) => setProdCatSlug(e.target.value)}
                    className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                    Sale Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm font-bold focus:border-[#a8825b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                    Regular / Strikethrough Price (৳)
                  </label>
                  <input
                    type="number"
                    value={prodRegPrice}
                    onChange={(e) => setProdRegPrice(e.target.value)}
                    className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Automated Cloudinary Dropzones & Dynamic Gallery */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                      Primary Product Photo *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Main image displayed on the storefront catalog grid.
                    </p>
                    <ImageUploadDropzone
                      value={prodPrimaryImg}
                      onChange={setProdPrimaryImg}
                      folder="products"
                      label="Drop Primary Product Photo (Cloudinary)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                      Hover Photo (Model / Detail Angle)
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Swaps smoothly when visitors hover over the product card.
                    </p>
                    <ImageUploadDropzone
                      value={prodHoverImg}
                      onChange={setProdHoverImg}
                      folder="products"
                      label="Drop Hover / Secondary Photo (Cloudinary)"
                    />
                  </div>
                </div>

                {/* Additional Dynamic Photo Slots */}
                {prodAdditionalImgs.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#e3ded3] bg-[#ede8dc]/40 space-y-2 animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-display tracking-wider font-bold text-[#3d2b1f]">
                        Additional Gallery Angle #{idx + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePhotoSlot(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-display uppercase tracking-wider font-bold cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo Option</span>
                      </button>
                    </div>
                    <ImageUploadDropzone
                      value={imgUrl}
                      onChange={(url) => handleUpdatePhotoSlot(idx, url)}
                      folder="products"
                      label={`Drop Additional Photo #${idx + 1} (Cloudinary)`}
                    />
                  </div>
                ))}

                {/* Plus button to add another picture upload option */}
                <button
                  type="button"
                  onClick={handleAddPhotoSlot}
                  className="w-full py-3.5 px-4 border-2 border-dashed border-[#c59f72] hover:border-[#4e3828] bg-[#ede8dc]/30 hover:bg-[#ede8dc] rounded-xl flex items-center justify-center gap-2 text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-[#a8825b]" />
                  <span>+ Add Another Picture Upload Option</span>
                </button>
              </div>

              {/* Universal Material & Specifications Field (Dynamic Category-Aware) */}
              <div>
                <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                  {!prodCatSlug ||
                  (!['accessories', 'leather-goods', 'bags', 'wallets', 'belts', 'footwear', 'shoes'].some((slug) =>
                    prodCatSlug.toLowerCase().includes(slug)
                  ) &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('accessories') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('leather') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('bag') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('wallet') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('belt'))
                    ? 'Fabric & Weave Specification'
                    : 'Material & Craftsmanship Specification'}
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  {!prodCatSlug ||
                  (!['accessories', 'leather-goods', 'bags', 'wallets', 'belts', 'footwear', 'shoes'].some((slug) =>
                    prodCatSlug.toLowerCase().includes(slug)
                  ) &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('accessories') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('leather') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('bag') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('wallet') &&
                  !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('belt'))
                    ? 'Tailoring weave, GSM weight, and textile composition.'
                    : 'Material grade, hardware finish, inner lining, and craftsmanship details.'}
                </p>
                <input
                  type="text"
                  placeholder={
                    !prodCatSlug ||
                    (!['accessories', 'leather-goods', 'bags', 'wallets', 'belts', 'footwear', 'shoes'].some((slug) =>
                      prodCatSlug.toLowerCase().includes(slug)
                    ) &&
                    !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('accessories') &&
                    !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('leather') &&
                    !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('bag') &&
                    !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('wallet') &&
                    !categories.find((c) => c.slug === prodCatSlug)?.name?.toLowerCase().includes('belt'))
                      ? 'e.g. 100% Premium Textured Cotton (190 GSM)'
                      : 'e.g. Full-Grain Vegetable-Tanned Italian Leather, Solid Brass Hardware'
                  }
                  value={prodFabric}
                  onChange={(e) => setProdFabric(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                  Product Editorial Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the craftsmanship, tailoring, comfort, and occasion suitability..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                />
              </div>

              {/* ========================================================
                  HIERARCHICAL INVENTORY MODEL (Product -> Colour -> Sizes)
                  ======================================================== */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#ede8dc]/60 border border-[#e3ded3] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3ded3] pb-3">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-[#a8825b]" />
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base uppercase tracking-wider text-[#3d2b1f]">
                        Hierarchical Inventory Matrix (Product &rarr; Colour &rarr; Sizes)
                      </h3>
                      <p className="text-[11px] text-[#6e5d52]">
                        Define colors, then configure size stock allocations under each color variant.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#6e5d52] font-mono">Neon Live Ledger</span>
                </div>

                {/* Inventory Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      prodInventoryType === 'sizes'
                        ? 'bg-[#fcfbf7] border-[#4e3828] shadow-xs'
                        : 'bg-[#ede8dc] border-[#e3ded3] opacity-75'
                    }`}
                  >
                    <input
                      type="radio"
                      name="invType"
                      value="sizes"
                      checked={prodInventoryType === 'sizes'}
                      onChange={() => setProdInventoryType('sizes')}
                      className="mt-1 text-[#a8825b] focus:ring-[#a8825b]"
                    />
                    <div>
                      <span className="font-display uppercase tracking-wider font-bold text-xs text-[#3d2b1f] block">
                        Apparel Sizing (Colour &rarr; M, L, XL, XXL)
                      </span>
                      <p className="text-[11px] text-[#6e5d52] mt-0.5">
                        Track stock per individual garment size under each color shade. Ideal for shirts, trousers, and panjabis.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      prodInventoryType === 'single'
                        ? 'bg-[#fcfbf7] border-[#4e3828] shadow-xs'
                        : 'bg-[#ede8dc] border-[#e3ded3] opacity-75'
                    }`}
                  >
                    <input
                      type="radio"
                      name="invType"
                      value="single"
                      checked={prodInventoryType === 'single'}
                      onChange={() => setProdInventoryType('single')}
                      className="mt-1 text-[#a8825b] focus:ring-[#a8825b]"
                    />
                    <div>
                      <span className="font-display uppercase tracking-wider font-bold text-xs text-[#3d2b1f] block">
                        Single Unit / Universal (Colour &rarr; One Size)
                      </span>
                      <p className="text-[11px] text-[#6e5d52] mt-0.5">
                        No garment sizing. Ideal for leather bags, wallets, belts, and accessories.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Colour Variants Matrix */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase font-display tracking-wider font-bold text-[#3d2b1f]">
                      Colour Variants &amp; Stock Allocations ({prodColors.length} configured)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="inline-flex items-center gap-1.5 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#3d2b1f] bg-[#fcfbf7] border border-[#e3ded3] px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Colour Variant</span>
                    </button>
                  </div>

                  {prodColors.map((colorObj, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-4 rounded-xl border border-[#e3ded3] bg-[#fcfbf7] space-y-3.5 shadow-2xs"
                    >
                      {/* Color Header: Name, Hex, Swatch, Delete & Copy */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3ded3] pb-3">
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Color Swatch Circle */}
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={colorObj.hex.startsWith('#') && colorObj.hex.length === 7 ? colorObj.hex : '#212121'}
                              onChange={(e) => handleUpdateColorField(cIdx, 'hex', e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-[#e3ded3] bg-transparent p-0.5"
                              title="Pick Color Swatch"
                            />
                            <span
                              className="w-5 h-5 rounded-full inline-block border border-[#4e3828]/20 shadow-2xs"
                              style={{ backgroundColor: colorObj.hex || '#212121' }}
                            />
                          </div>

                          {/* Color Name */}
                          <div>
                            <label className="block text-[10px] uppercase font-display tracking-wider font-bold text-[#6e5d52]">
                              Colour Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sage Olive, Ivory Cream"
                              value={colorObj.name}
                              onChange={(e) => handleUpdateColorField(cIdx, 'name', e.target.value)}
                              className="bg-[#ede8dc] border border-[#e3ded3] rounded-lg px-3 py-1.5 text-xs font-bold text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none min-w-[160px]"
                            />
                          </div>

                          {/* Hex Code */}
                          <div>
                            <label className="block text-[10px] uppercase font-display tracking-wider font-bold text-[#6e5d52]">
                              Hex Code
                            </label>
                            <input
                              type="text"
                              placeholder="#6B7A66"
                              value={colorObj.hex}
                              onChange={(e) => handleUpdateColorField(cIdx, 'hex', e.target.value)}
                              className="bg-[#ede8dc] border border-[#e3ded3] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none w-24"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-[#ede8dc] px-2.5 py-1 rounded-lg border border-[#e3ded3] text-[#3d2b1f]">
                            Subtotal: {colorObj.stock || 0} units
                          </span>

                          {prodColors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(cIdx)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove this colour variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Color Inventory Input: Sizes or Single */}
                      {prodInventoryType === 'sizes' ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-display uppercase tracking-wider font-bold text-[#6e5d52]">
                              Sizes for &ldquo;{colorObj.name || `Color ${cIdx + 1}`}&rdquo;
                            </span>
                            {prodColors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleCopySizesToAllColors(cIdx)}
                                className="inline-flex items-center gap-1 text-[11px] font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#3d2b1f] cursor-pointer"
                                title="Replicate these size stocks to every other color"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Apply sizes to all colours</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {(colorObj.sizes || []).map((s) => (
                              <div key={s.size} className="bg-[#ede8dc]/50 p-2.5 rounded-xl border border-[#e3ded3]">
                                <span className="font-display font-bold text-xs uppercase tracking-wider block text-[#3d2b1f] mb-1">
                                  Size {s.size}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  value={s.stock}
                                  onChange={(e) => handleUpdateColorSizeStock(cIdx, s.size, e.target.value)}
                                  className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#a8825b]"
                                />
                                <span className="text-[10px] text-gray-500 mt-1 block">
                                  Chest {s.chest}&quot; • L {s.length}&quot;
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Single Unit Stock Input */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] uppercase font-display tracking-wider font-bold mb-1 text-[#6e5d52]">
                              Stock for &ldquo;{colorObj.name || `Color ${cIdx + 1}`}&rdquo; (Units) *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={colorObj.stock}
                              onChange={(e) => handleUpdateColorSingleStock(cIdx, e.target.value)}
                              className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-2 text-sm font-mono font-bold focus:border-[#a8825b] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="w-full py-3 px-4 border-2 border-dashed border-[#c59f72] hover:border-[#4e3828] bg-[#fcfbf7] hover:bg-[#ede8dc] rounded-xl flex items-center justify-center gap-2 text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-[#a8825b]" />
                    <span>+ Add Another Colour Variant</span>
                  </button>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-[#6e5d52]">Grand Total Initial Stock:</span>
                    <strong className="text-sm text-[#3d2b1f] font-mono font-bold">
                      {prodColors.reduce((sum, c) => {
                        if (prodInventoryType === 'single') return sum + (Number(c.stock) || 0);
                        return sum + (c.sizes || []).reduce((sSum, s) => sSum + (Number(s.stock) || 0), 0);
                      }, 0)}{' '}
                      units
                    </strong>
                  </div>
                </div>

                {/* Low Stock Warning Threshold */}
                <div className="pt-3 border-t border-[#e3ded3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs uppercase font-display tracking-wider font-bold text-[#3d2b1f] block">
                      Low-Stock Warning Threshold (Units)
                    </label>
                    <span className="text-[11px] text-[#6e5d52]">
                      When warehouse stock drops to or below this count, a warning badge appears and factory reorder is triggered.
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={prodLowStockThreshold}
                    onChange={(e) => setProdLowStockThreshold(e.target.value)}
                    className="w-24 bg-[#fcfbf7] border border-[#e3ded3] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-[#a8825b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkboxes Row */}
              <div className="p-4 rounded-xl bg-[#ede8dc] border border-[#e3ded3] flex flex-wrap gap-6 items-center">
                <label className="flex items-center gap-2 cursor-pointer font-display text-xs uppercase tracking-wider font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsActive}
                    onChange={(e) => setProdIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b]"
                  />
                  <span>Show on Website immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-display text-xs uppercase tracking-wider font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsBestSeller}
                    onChange={(e) => setProdIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b]"
                  />
                  <span>Best Seller Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-display text-xs uppercase tracking-wider font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsNewArrival}
                    onChange={(e) => setProdIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b]"
                  />
                  <span>New Arrival Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-display text-xs uppercase tracking-wider font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsTodaysDeal}
                    onChange={(e) => setProdIsTodaysDeal(e.target.checked)}
                    className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b]"
                  />
                  <span>Today&apos;s Deal</span>
                </label>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white py-3.5 rounded-xl font-display uppercase tracking-widest text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Publish SKU Directly to Neon DB
                </button>
                <button
                  type="button"
                  onClick={() => setTab('inventory')}
                  className="px-6 py-3.5 border border-[#e3ded3] rounded-xl font-display uppercase tracking-wider text-xs text-[#6e5d52] hover:text-[#3d2b1f] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: CATEGORIES MANAGEMENT WITH DIRECT CHECKBOX SYSTEM
            ======================================================== */}
        {tab === 'categories' && (
          <div className="space-y-8">
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-6 sm:p-8 shadow-xs">
              <div className="border-b border-[#e3ded3] pb-4 mb-6">
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#3d2b1f]">
                  Create New Modular Category
                </h2>
                <p className="text-xs sm:text-sm text-[#6e5d52] mt-0.5">
                  Categories power the storefront navigation and collection grids. Unchecking hides the category safely without deleting products.
                </p>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-5 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Category Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vintage Panjabi / Polo Shirts / Accessories"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Menu Sort Order
                    </label>
                    <input
                      type="number"
                      value={catSortOrder}
                      onChange={(e) => setCatSortOrder(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                      Category Card Image *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Used on homepage collection grid cards.
                    </p>
                    <ImageUploadDropzone
                      value={catCardImg}
                      onChange={setCatCardImg}
                      folder="categories"
                      label="Drop Category Card Image"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                      Banner Image (Optional)
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Used at the top of the collection filter view.
                    </p>
                    <ImageUploadDropzone
                      value={catBannerImg}
                      onChange={setCatBannerImg}
                      folder="categories"
                      label="Drop Category Banner Image"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-display text-xs uppercase tracking-wider font-bold">
                    <input
                      type="checkbox"
                      checked={catIsActive}
                      onChange={(e) => setCatIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b]"
                    />
                    <span>Show on Storefront Immediately</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white px-6 py-3 rounded-xl font-display uppercase tracking-wider text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Create &amp; Publish Category
                </button>
              </form>
            </div>

            {/* Existing Categories Table */}
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#e3ded3]">
                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-[#3d2b1f]">
                  Existing Categories &amp; Direct Checkbox Visibility
                </h3>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Uncheck any category to instantly hide it from navigation menus and home grids without removing database items.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Slug Identifier</th>
                      <th className="py-3 px-4 text-center">Sort Order</th>
                      <th className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1" title="Uncheck to hide">
                          <span>Visible in Store</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3ded3]">
                    {categories.map((c) => {
                      const isActive = c.isActive !== false;
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-[#f6f3eb] transition-colors ${
                            !isActive ? 'opacity-60 bg-[#f9f7f2]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={c.cardImage}
                                alt={c.name}
                                className="w-12 h-12 object-cover rounded-lg border border-[#e3ded3] bg-[#ede8dc]"
                              />
                              <span className="font-semibold text-sm text-[#3d2b1f]">{c.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-gray-500">{c.slug}</td>
                          <td className="py-3.5 px-4 text-center font-display font-semibold">
                            {c.sortOrder || 0}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleCategory(c.id, isActive, c.name)}
                                className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b] cursor-pointer"
                              />
                              <span
                                className={`text-[11px] font-display uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isActive ? 'Showing' : 'Hidden'}
                              </span>
                            </label>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCategory(c.id, c.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: HERO SLIDER MANAGEMENT WITH DIRECT CHECKBOX SYSTEM
            ======================================================== */}
        {tab === 'hero' && (
          <div className="space-y-8">
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-6 sm:p-8 shadow-xs">
              <div className="border-b border-[#e3ded3] pb-4 mb-6">
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#3d2b1f]">
                  Publish New Hero Slide
                </h2>
                <p className="text-xs sm:text-sm text-[#6e5d52] mt-0.5">
                  Full-width editorial slides rotating smoothly at the top of the homepage.
                </p>
              </div>

              <form onSubmit={handleCreateHeroSlide} className="space-y-5 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Main Editorial Headline *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Sartorial Autumn Atelier"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Subtitle / Narrative
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Handcrafted from pure Egyptian cottons."
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={heroBadge}
                      onChange={(e) => setHeroBadge(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={heroCtaText}
                      onChange={(e) => setHeroCtaText(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Button Link URL
                    </label>
                    <input
                      type="text"
                      value={heroLinkUrl}
                      onChange={(e) => setHeroLinkUrl(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                    Hero Slide Photo (Cloudinary) *
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Wide high-resolution banner photo (16:9 or 21:9 ratio recommended).
                  </p>
                  <ImageUploadDropzone
                    value={heroImgUrl}
                    onChange={setHeroImgUrl}
                    folder="hero"
                    label="Drop Hero Slide Banner (Cloudinary)"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-display text-xs uppercase tracking-wider font-bold">
                    <input
                      type="checkbox"
                      checked={heroIsActive}
                      onChange={(e) => setHeroIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b]"
                    />
                    <span>Activate on Homepage Carousel Immediately</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white px-6 py-3 rounded-xl font-display uppercase tracking-wider text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Publish Hero Slide
                </button>
              </form>
            </div>

            {/* Existing Slides Table */}
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#e3ded3]">
                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-[#3d2b1f]">
                  Active Homepage Slides
                </h3>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Use checkboxes to pause any slide from rotating on the storefront.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                    <tr>
                      <th className="py-3 px-4">Banner Preview</th>
                      <th className="py-3 px-4">Headline &amp; Subtitle</th>
                      <th className="py-3 px-4">CTA Action</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3ded3]">
                    {heroSlides.map((s) => {
                      const isActive = s.isActive !== false;
                      return (
                        <tr
                          key={s.id}
                          className={`hover:bg-[#f6f3eb] transition-colors ${
                            !isActive ? 'opacity-60 bg-[#f9f7f2]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <img
                              src={s.imageUrl}
                              alt={s.title}
                              className="w-24 h-14 object-cover rounded-lg border border-[#e3ded3] bg-[#ede8dc]"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-sm text-[#3d2b1f]">{s.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{s.subtitle}</p>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-[#a8825b]">
                            {s.ctaText} &rarr; {s.linkUrl}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleHeroSlide(s.id, isActive, s.title)}
                                className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b] cursor-pointer"
                              />
                              <span
                                className={`text-[11px] font-display uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isActive ? 'Active' : 'Paused'}
                              </span>
                            </label>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteHeroSlide(s.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Slide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PROMO BLOCKS WITH DIRECT CHECKBOX SYSTEM
            ======================================================== */}
        {tab === 'layout' && (
          <div className="space-y-8">
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-6 sm:p-8 shadow-xs">
              <div className="border-b border-[#e3ded3] pb-4 mb-6">
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#3d2b1f]">
                  Publish Homepage Bento Block
                </h2>
                <p className="text-xs sm:text-sm text-[#6e5d52] mt-0.5">
                  Editorial masonry banners driving traffic to specific category collections.
                </p>
              </div>

              <form onSubmit={handleCreatePromoBlock} className="space-y-5 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Block Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Textured Old Money Shirts"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                      Linked Category Collection *
                    </label>
                    <select
                      value={promoCatSlug}
                      onChange={(e) => setPromoCatSlug(e.target.value)}
                      className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-3 text-sm focus:border-[#a8825b] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                    Bento Image (Cloudinary) *
                  </label>
                  <ImageUploadDropzone
                    value={promoImgUrl}
                    onChange={setPromoImgUrl}
                    folder="promo"
                    label="Drop Bento Banner Image"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-display text-xs uppercase tracking-wider font-bold">
                    <input
                      type="checkbox"
                      checked={promoIsActive}
                      onChange={(e) => setPromoIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b]"
                    />
                    <span>Show in Homepage Bento Grid</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white px-6 py-3 rounded-xl font-display uppercase tracking-wider text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Publish Promo Block
                </button>
              </form>
            </div>

            {/* Existing Promo Blocks */}
            <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#e3ded3]">
                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-[#3d2b1f]">
                  Homepage Promo Blocks
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Title &amp; Category</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3ded3]">
                    {promoBlocks.map((b) => {
                      const isActive = b.isActive !== false;
                      return (
                        <tr
                          key={b.id}
                          className={`hover:bg-[#f6f3eb] transition-colors ${
                            !isActive ? 'opacity-60 bg-[#f9f7f2]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <img
                              src={b.imageUrl}
                              alt={b.title}
                              className="w-18 h-12 object-cover rounded-lg border border-[#e3ded3] bg-[#ede8dc]"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-sm text-[#3d2b1f]">{b.title}</p>
                            <span className="text-xs text-gray-500 font-mono">{b.categorySlug}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleTogglePromoBlock(b.id, isActive, b.title)}
                                className="w-4 h-4 text-[#a8825b] rounded border-gray-300 focus:ring-[#a8825b] cursor-pointer"
                              />
                              <span
                                className={`text-[11px] font-display uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isActive ? 'Live' : 'Hidden'}
                              </span>
                            </label>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeletePromoBlock(b.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: ORDERS MANAGEMENT & INVOICE GENERATOR
            ======================================================== */}
        {tab === 'orders' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f]">
                  Customer Orders &amp; Dispatch ({orders.length})
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Changing status to &quot;cancelled&quot; automatically restores stock to Neon inventory.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order #, customer, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Orders Summary KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Orders Placed</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Recorded in Neon Ledger</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Gross Sales</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Excluding Cancelled Orders</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-amber-800 font-semibold">Pending Verification</span>
                <p className="text-2xl font-display font-bold text-amber-700 mt-1">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">Awaiting Courier Dispatch</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-emerald-800 font-semibold">Delivered Parcels</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {orders.filter((o) => o.status === 'delivered').length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Completed Doorstep Delivery</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer &amp; Phone</th>
                    <th className="py-3 px-4">Delivery &amp; Zone</th>
                    <th className="py-3 px-4">Items Ordered</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No orders match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const items = Array.isArray(o.items) ? o.items : [];
                      return (
                        <tr key={o.id} className="hover:bg-[#f6f3eb] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#3d2b1f]">
                            {o.orderNumber}
                            <span className="block text-[10px] text-gray-400 font-normal">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-xs text-[#3d2b1f]">{o.customerName}</p>
                            <span className="text-xs text-[#6e5d52] font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[#a8825b]" />
                              {o.customerPhone}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <p className="text-[#6e5d52] line-clamp-1 max-w-[200px]">
                              {o.shippingAddress}
                            </p>
                            <span className="text-[10px] uppercase font-display font-bold text-[#a8825b]">
                              {o.deliveryZone}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <div className="space-y-0.5 max-w-[220px]">
                              {items.map((it, idx) => (
                                <p key={idx} className="line-clamp-1 text-[#3d2b1f]">
                                  &bull; {it.name} (
                                  {it.size === 'ONE_SIZE' ? 'Universal' : it.size} &times;{' '}
                                  {it.quantity})
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                            ৳ {Number(o.totalAmount).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <span className="px-2 py-0.5 rounded bg-[#ede8dc] text-[#3d2b1f] font-semibold">
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              className={`text-xs font-display uppercase tracking-wider font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${
                                o.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : o.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : o.status === 'shipped'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : o.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled (Auto-Restock)</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => generateOrderInvoice(o)}
                              className="inline-flex items-center gap-1.5 bg-[#ede8dc] hover:bg-[#4e3828] hover:text-[#f4b66b] text-[#3d2b1f] px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer border border-[#e3ded3]"
                              title="Download PDF Invoice"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}



                {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: CLOUDINARY CDN HUB (Health & Direct Dropzone)
            ======================================================== */}
        {tab === 'media' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
            <div className="border-b border-[#e3ded3] pb-4">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-6 h-6 text-[#a8825b]" />
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#3d2b1f]">
                  Cloudinary Media &amp; Edge CDN Engine
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#6e5d52] mt-1">
                Connected directly to cloud: <code className="bg-[#ede8dc] px-2 py-0.5 rounded font-bold font-mono">xqnmbmbd</code>. All product and banner assets are stored redundantly on worldwide edge servers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#ede8dc]/50 p-4 rounded-xl border border-[#e3ded3]">
                <span className="text-xs uppercase font-display tracking-wider text-gray-500 font-semibold">
                  Storage Status
                </span>
                <p className="text-lg font-display font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Online &amp; Active</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Cloudinary Edge Node</p>
              </div>

              <div className="bg-[#ede8dc]/50 p-4 rounded-xl border border-[#e3ded3]">
                <span className="text-xs uppercase font-display tracking-wider text-gray-500 font-semibold">
                  Automatic Optimization
                </span>
                <p className="text-lg font-display font-bold text-[#3d2b1f] mt-1">
                  f_auto, q_auto
                </p>
                <p className="text-[11px] text-gray-500 mt-1">WebP/AVIF Auto Compression</p>
              </div>

              <div className="bg-[#ede8dc]/50 p-4 rounded-xl border border-[#e3ded3]">
                <span className="text-xs uppercase font-display tracking-wider text-gray-500 font-semibold">
                  Database Link
                </span>
                <p className="text-lg font-display font-bold text-[#a8825b] mt-1">
                  Neon PostgreSQL
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Singapore ap-southeast-1</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                Standalone Asset Upload Test
              </label>
              <ImageUploadDropzone
                folder="general"
                label="Drop Any Image to Generate Cloudinary CDN URL"
                onChange={(url) => {
                  navigator.clipboard?.writeText(url);
                  notify(`Uploaded! URL copied to clipboard: ${url}`);
                }}
              />
            </div>
          </div>
        )}



        {/* ========================================================
            TAB: CLIENT DIRECTORY & CUSTOMER PROFILES
            ======================================================== */}
        {tab === 'customers' && (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e3ded3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a8825b]" />
                  <span>Customer Directory &amp; Client Ledger ({uniqueCustomers.length})</span>
                </h2>
                <p className="text-xs text-[#6e5d52] mt-0.5">
                  Distinct buyer profiles aggregated across verified Neon orders, lifetime spend (LTV), and delivery locations.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] text-xs rounded-xl pl-9 pr-3 py-2 text-[#3d2b1f] focus:outline-none focus:border-[#a8825b]"
                />
              </div>
            </div>

            {/* Quick KPI stats for customers */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e3ded3] border-b border-[#e3ded3] bg-[#fcfbf7]">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Total Unique Clients</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">{uniqueCustomers.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Direct Storefront Buyers</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Cumulative Orders</span>
                <p className="text-2xl font-display font-bold text-[#a8825b] mt-1">{orders.length}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Total Completed &amp; Active</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Customer Gross LTV</span>
                <p className="text-2xl font-display font-bold text-[#3d2b1f] mt-1">৳ {totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#878278] mt-0.5">Across All Completed Checkouts</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#6e5d52] font-semibold">Repeat Buyers</span>
                <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                  {uniqueCustomers.filter((c) => c.ordersCount > 1).length}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Clients with 2+ Purchases</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#ede8dc] text-xs uppercase font-display tracking-wider text-[#6e5d52] border-b border-[#e3ded3]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Primary Delivery Address</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend (LTV)</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded3]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500">
                        No customer profiles match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f6f3eb] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs sm:text-sm text-[#3d2b1f]">{c.name}</p>
                          <span className="text-[11px] text-[#6e5d52] font-mono">
                            {c.email || 'No email provided'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a8825b] hover:text-[#4e3828] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{c.phone}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6e5d52] max-w-[240px]">
                          <p className="line-clamp-2">{c.address || 'Standard Address'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-display uppercase tracking-wider font-bold bg-[#ede8dc] text-[#3d2b1f]">
                            {c.deliveryZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ede8dc] font-display font-bold text-xs text-[#3d2b1f]">
                            {c.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-[#3d2b1f]">
                          ৳ {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-mono font-bold text-[#3d2b1f]">{c.lastOrderNumber}</p>
                          <span className="text-[11px] text-[#6e5d52]">
                            {new Date(c.lastOrderDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOrderSearch(c.phone !== 'N/A' ? c.phone : c.name);
                              setTab('orders');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider font-bold text-[#a8825b] hover:text-[#4e3828] hover:underline cursor-pointer"
                          >
                            <span>View Orders</span>
                            <span>&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          STOCK ADJUSTMENT MODAL (Full Variant / Single Stock Override)
          ======================================================== */}
      {stockEditModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1a100b]/60 backdrop-blur-xs"
            onClick={() => setStockEditModal(null)}
          />
          <div className="relative bg-[#fcfbf7] border border-[#e3ded3] w-full max-w-lg rounded-2xl shadow-2xl z-10 p-6 text-[#3d2b1f]">
            <div className="flex items-center justify-between border-b border-[#e3ded3] pb-3.5 mb-5">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg uppercase tracking-wider text-[#3d2b1f]">
                  Stock Management: {stockEditModal.sku}
                </h3>
                <p className="text-xs text-[#6e5d52] line-clamp-1">{stockEditModal.name}</p>
              </div>
              <button
                onClick={() => setStockEditModal(null)}
                className="text-gray-400 hover:text-[#3d2b1f] p-1.5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProductStock} className="space-y-4">
              {/* Hierarchical Colour -> Sizes Editor */}
              {Array.isArray(stockEditModal.colors) && stockEditModal.colors.length > 0 ? (
                <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  {stockEditModal.colors.map((c, cIdx) => {
                    const isSingleColor = stockEditModal.inventoryType === 'single';
                    return (
                      <div
                        key={c.name || cIdx}
                        className="bg-[#ede8dc]/50 p-3.5 rounded-xl border border-[#e3ded3] space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full inline-block border border-[#4e3828]/20 shadow-2xs shrink-0"
                              style={{ backgroundColor: c.hex || '#212121' }}
                            />
                            <span className="font-display font-bold text-xs uppercase tracking-wider text-[#3d2b1f]">
                              {c.name}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#6e5d52] bg-[#fcfbf7] px-2 py-0.5 rounded-md border border-[#e3ded3]">
                            {c.stock || 0} units
                          </span>
                        </div>

                        {isSingleColor ? (
                          <div>
                            <label className="block text-[11px] uppercase font-display tracking-wider font-bold mb-1 text-[#6e5d52]">
                              Warehouse Stock (Units)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={c.stock}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                setStockEditModal((prev) => {
                                  const copyColors = [...prev.colors];
                                  copyColors[cIdx] = {
                                    ...copyColors[cIdx],
                                    stock: val,
                                    sizes: [{ size: 'ONE_SIZE', stock: val }]
                                  };
                                  const newTotal = copyColors.reduce(
                                    (sum, item) => sum + (Number(item.stock) || 0),
                                    0
                                  );
                                  return { ...prev, colors: copyColors, totalStock: newTotal };
                                });
                              }}
                              className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:border-[#a8825b] focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(c.sizes || []).map((s, sIdx) => (
                              <div
                                key={s.size}
                                className="bg-[#fcfbf7] p-2 rounded-lg border border-[#e3ded3]"
                              >
                                <span className="font-display font-bold text-[11px] uppercase block text-[#3d2b1f] mb-1">
                                  {s.size}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  value={s.stock}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value) || 0);
                                    setStockEditModal((prev) => {
                                      const copyColors = [...prev.colors];
                                      const targetColor = { ...copyColors[cIdx] };
                                      const copySizes = [...(targetColor.sizes || [])];
                                      copySizes[sIdx] = { ...copySizes[sIdx], stock: val };
                                      targetColor.sizes = copySizes;
                                      targetColor.stock = copySizes.reduce(
                                        (sum, item) => sum + (Number(item.stock) || 0),
                                        0
                                      );
                                      copyColors[cIdx] = targetColor;

                                      const newTotal = copyColors.reduce(
                                        (sum, item) => sum + (Number(item.stock) || 0),
                                        0
                                      );
                                      return { ...prev, colors: copyColors, totalStock: newTotal };
                                    });
                                  }}
                                  className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-md px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:border-[#a8825b]"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <p className="text-xs text-[#6e5d52] text-right">
                    Calculated Total Units across all colours:{' '}
                    <strong className="text-[#3d2b1f] font-mono font-bold">
                      {stockEditModal.totalStock} units
                    </strong>
                  </p>
                </div>
              ) : stockEditModal.inventoryType === 'single' ? (
                /* Fallback if no colors object: Single Unit */
                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                    Total Warehouse Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockEditModal.totalStock}
                    onChange={(e) =>
                      setStockEditModal((prev) => ({
                        ...prev,
                        totalStock: Number(e.target.value) || 0
                      }))
                    }
                    className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:border-[#a8825b] focus:outline-none"
                  />
                </div>
              ) : (
                /* Fallback if no colors object: Flat sizes */
                <div>
                  <label className="block text-xs uppercase font-display tracking-wider font-bold mb-2">
                    Size-by-Size Units in Warehouse
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {stockEditModal.sizes?.map((s, idx) => (
                      <div key={s.size} className="bg-[#ede8dc] p-3 rounded-xl border border-[#e3ded3]">
                        <span className="font-display font-bold text-xs uppercase block text-[#3d2b1f] mb-1">
                          Size {s.size}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={s.stock}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setStockEditModal((prev) => {
                              const copy = [...prev.sizes];
                              copy[idx] = { ...copy[idx], stock: val };
                              const newTotal = copy.reduce(
                                (sum, item) => sum + (Number(item.stock) || 0),
                                0
                              );
                              return { ...prev, sizes: copy, totalStock: newTotal };
                            });
                          }}
                          className="w-full bg-[#fcfbf7] border border-[#e3ded3] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#a8825b]"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#6e5d52] mt-2 text-right">
                    Calculated Total Units:{' '}
                    <strong className="text-[#3d2b1f] font-mono font-bold">
                      {stockEditModal.totalStock}
                    </strong>
                  </p>
                </div>
              )}

              {/* Threshold */}
              <div className="pt-2 border-t border-[#e3ded3]">
                <label className="block text-xs uppercase font-display tracking-wider font-bold mb-1">
                  Low Stock Warning Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockEditModal.lowStockThreshold}
                  onChange={(e) =>
                    setStockEditModal((prev) => ({
                      ...prev,
                      lowStockThreshold: Number(e.target.value) || 5
                    }))
                  }
                  className="w-full bg-[#ede8dc] border border-[#e3ded3] rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:border-[#a8825b] focus:outline-none"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Triggers customer urgency cues (&ldquo;Only X Left&rdquo;) and admin reorder warnings.
                </span>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#4e3828] text-[#f4b66b] hover:bg-[#a8825b] hover:text-white py-2.5 rounded-xl text-xs font-display uppercase tracking-wider font-bold transition-all cursor-pointer shadow-md"
                >
                  Save Stock Overrides
                </button>
                <button
                  type="button"
                  onClick={() => setStockEditModal(null)}
                  className="px-4 py-2.5 border border-[#e3ded3] rounded-xl text-xs font-display uppercase tracking-wider font-bold text-[#6e5d52] hover:text-[#3d2b1f] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
