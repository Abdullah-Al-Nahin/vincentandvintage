import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_XxCTV4h3uEiO@ep-small-block-azng5vxf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

export const sql = neon(connectionString);

function formatProduct(row) {
  const totalStock = Number(row.total_stock !== null && row.total_stock !== undefined ? row.total_stock : 0);
  const lowStockThreshold = Number(row.low_stock_threshold) || 5;
  const isSoldOut = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= lowStockThreshold;

  let rawColors = typeof row.colors === 'string' ? JSON.parse(row.colors) : (row.colors || []);
  let rawSizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : (row.sizes || []);

  // Standardize colors array with sizes and per-color stock
  const colors = rawColors.map((c) => {
    let cSizes = Array.isArray(c.sizes) ? c.sizes : [];
    if (cSizes.length === 0 && rawSizes.length > 0) {
      cSizes = rawSizes.map((s) => ({
        size: s.size,
        stock: Number(s.stock) || 0,
        chest: s.chest || '42',
        length: s.length || '29'
      }));
    }
    const colorStock =
      c.stock !== undefined && c.stock !== null
        ? Number(c.stock)
        : cSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

    return {
      name: c.name || 'Standard',
      hex: c.hex || '#212121',
      stock: colorStock,
      sizes: cSizes
    };
  });

  // Size rollup across all colors for backward compatibility
  const sizesMap = {};
  colors.forEach((c) => {
    (c.sizes || []).forEach((s) => {
      if (!sizesMap[s.size]) {
        sizesMap[s.size] = { size: s.size, stock: 0, chest: s.chest, length: s.length };
      }
      sizesMap[s.size].stock += Number(s.stock) || 0;
    });
  });
  const aggregatedSizes = Object.values(sizesMap);
  const finalSizes = aggregatedSizes.length > 0 ? aggregatedSizes : rawSizes;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    category: row.category_name || row.category_slug || 'Apparel',
    categorySlug: row.category_slug,
    regularPrice: Number(row.regular_price),
    salePrice: Number(row.sale_price),
    description: row.description,
    fabric: row.fabric,
    primaryImage: row.primary_image,
    hoverImage: row.hover_image || row.primary_image,
    gallery: typeof row.gallery === 'string' ? JSON.parse(row.gallery) : (row.gallery || []),
    sizes: finalSizes,
    colors,
    rating: Number(row.rating) || 4.9,
    reviewsCount: row.reviews_count || 18,
    isBestSeller: Boolean(row.is_best_seller),
    isNewArrival: Boolean(row.is_new_arrival),
    isTodaysDeal: Boolean(row.is_todays_deal),
    isActive: row.is_active !== false,
    totalStock,
    lowStockThreshold,
    inventoryType: row.inventory_type || 'sizes',
    isSoldOut,
    isLowStock,
    createdAt: row.created_at
  };
}

/* ========================================================
   1. CATEGORIES CRUD
   ======================================================== */
export async function getOnlineCategories({ includeInactive = false } = {}) {
  try {
    const rows = includeInactive
      ? await sql`SELECT * FROM categories ORDER BY sort_order ASC, id ASC`
      : await sql`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, id ASC`;
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      cardImage: r.card_image,
      bannerImage: r.banner_image,
      sortOrder: r.sort_order || 0,
      isActive: r.is_active !== false
    }));
  } catch (err) {
    console.error('getOnlineCategories error:', err.message);
    return [];
  }
}

export async function createOnlineCategory(data) {
  const slug = (data.name || 'category')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const [row] = await sql`
    INSERT INTO categories (name, slug, card_image, banner_image, sort_order, is_active)
    VALUES (${data.name.trim()}, ${slug}, ${data.cardImage}, ${data.bannerImage || data.cardImage}, ${Number(data.sortOrder) || 0}, ${data.isActive !== false})
    RETURNING *
  `;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    cardImage: row.card_image,
    bannerImage: row.banner_image,
    sortOrder: row.sort_order,
    isActive: row.is_active !== false
  };
}

export async function toggleOnlineCategoryStatus(id, isActive) {
  const [row] = await sql`
    UPDATE categories SET is_active = ${Boolean(isActive)} WHERE id = ${Number(id)} RETURNING *
  `;
  return row ? {
    id: row.id,
    name: row.name,
    slug: row.slug,
    cardImage: row.card_image,
    bannerImage: row.banner_image,
    sortOrder: row.sort_order,
    isActive: row.is_active !== false
  } : null;
}

export async function deleteOnlineCategory(id) {
  await sql`DELETE FROM categories WHERE id = ${Number(id)}`;
  return true;
}

/* ========================================================
   2. HERO SLIDES & PROMO BLOCKS CRUD
   ======================================================== */
export async function getOnlineHeroSlides({ includeInactive = false } = {}) {
  try {
    const rows = includeInactive
      ? await sql`SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC`
      : await sql`SELECT * FROM hero_slides WHERE is_active = true ORDER BY sort_order ASC, id ASC`;
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      badge: r.badge,
      ctaText: r.cta_text || 'EXPLORE COLLECTION',
      linkUrl: r.link_url || '#catalog-section',
      image: r.image_url,
      sortOrder: r.sort_order,
      isActive: r.is_active !== false
    }));
  } catch (err) {
    console.error('getOnlineHeroSlides error:', err.message);
    return [];
  }
}

export async function createOnlineHeroSlide(data) {
  const [row] = await sql`
    INSERT INTO hero_slides (title, subtitle, badge, cta_text, link_url, image_url, sort_order, is_active)
    VALUES (
      ${data.title}, ${data.subtitle || ''}, ${data.badge || 'NEW SEASON'},
      ${data.ctaText || 'EXPLORE COLLECTION'}, ${data.linkUrl || '#catalog-section'},
      ${data.imageUrl}, ${Number(data.sortOrder) || 0}, ${data.isActive !== false}
    )
    RETURNING *
  `;
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    ctaText: row.cta_text,
    linkUrl: row.link_url,
    image: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active !== false
  };
}

export async function toggleOnlineHeroSlideStatus(id, isActive) {
  const [row] = await sql`
    UPDATE hero_slides SET is_active = ${Boolean(isActive)} WHERE id = ${Number(id)} RETURNING *
  `;
  return row ? {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    ctaText: row.cta_text,
    linkUrl: row.link_url,
    image: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active !== false
  } : null;
}

export async function deleteOnlineHeroSlide(id) {
  await sql`DELETE FROM hero_slides WHERE id = ${Number(id)}`;
  return true;
}

export async function getOnlinePromoBlocks({ includeInactive = false } = {}) {
  try {
    const rows = includeInactive
      ? await sql`SELECT * FROM promo_blocks ORDER BY sort_order ASC, id ASC`
      : await sql`SELECT * FROM promo_blocks WHERE is_active = true ORDER BY sort_order ASC, id ASC`;
    return rows.map(r => ({
      id: r.id,
      blockType: r.block_type,
      title: r.title,
      subtitle: r.subtitle,
      badge: r.badge,
      imageUrl: r.image_url,
      categorySlug: r.category_slug,
      sortOrder: r.sort_order,
      isActive: r.is_active !== false
    }));
  } catch (err) {
    console.error('getOnlinePromoBlocks error:', err.message);
    return [];
  }
}

export async function createOnlinePromoBlock(data) {
  const [row] = await sql`
    INSERT INTO promo_blocks (block_type, title, subtitle, badge, image_url, category_slug, sort_order, is_active)
    VALUES (
      ${data.blockType || 'bento_large'}, ${data.title}, ${data.subtitle || ''},
      ${data.badge || ''}, ${data.imageUrl}, ${data.categorySlug || ''},
      ${Number(data.sortOrder) || 0}, ${data.isActive !== false}
    )
    RETURNING *
  `;
  return {
    ...row,
    isActive: row.is_active !== false
  };
}

export async function toggleOnlinePromoBlockStatus(id, isActive) {
  const [row] = await sql`
    UPDATE promo_blocks SET is_active = ${Boolean(isActive)} WHERE id = ${Number(id)} RETURNING *
  `;
  return row ? {
    id: row.id,
    blockType: row.block_type,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    imageUrl: row.image_url,
    categorySlug: row.category_slug,
    sortOrder: row.sort_order,
    isActive: row.is_active !== false
  } : null;
}

export async function deleteOnlinePromoBlock(id) {
  await sql`DELETE FROM promo_blocks WHERE id = ${Number(id)}`;
  return true;
}

/* ========================================================
   3. PRODUCTS CRUD
   ======================================================== */
export async function getOnlineProducts({ category, search, includeInactive = false } = {}) {
  try {
    let rows;
    if (includeInactive) {
      if (category && category !== 'all' && search) {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          WHERE p.category_slug = ${category}
            AND (p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})
          ORDER BY p.id DESC
        `;
      } else if (category && category !== 'all') {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          WHERE p.category_slug = ${category}
          ORDER BY p.id DESC
        `;
      } else if (search) {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          WHERE p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'}
          ORDER BY p.id DESC
        `;
      } else {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          ORDER BY p.id DESC
        `;
      }
    } else {
      if (category && category !== 'all' && search) {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          WHERE p.is_active = true
            AND (c.is_active = true OR c.is_active IS NULL)
            AND p.category_slug = ${category}
            AND (p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})
          ORDER BY p.id DESC
        `;
      } else if (category && category !== 'all') {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          WHERE p.is_active = true
            AND (c.is_active = true OR c.is_active IS NULL)
            AND p.category_slug = ${category}
          ORDER BY p.id DESC
        `;
      } else if (search) {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          WHERE p.is_active = true
            AND (c.is_active = true OR c.is_active IS NULL)
            AND (p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})
          ORDER BY p.id DESC
        `;
      } else {
        rows = await sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_slug = c.slug
          WHERE p.is_active = true
            AND (c.is_active = true OR c.is_active IS NULL)
          ORDER BY p.id DESC
        `;
      }
    }
    return rows.map(formatProduct);
  } catch (err) {
    console.error('getOnlineProducts error:', err.message);
    return [];
  }
}

export async function getOnlineProductBySlugOrId(identifier) {
  try {
    if (!identifier) return null;
    let rows;
    const isNum = !isNaN(Number(identifier)) && String(Number(identifier)) === String(identifier);
    if (isNum) {
      rows = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_slug = c.slug
        WHERE p.id = ${Number(identifier)} OR p.slug = ${String(identifier)} OR p.sku = ${String(identifier)}
        LIMIT 1
      `;
    } else {
      rows = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_slug = c.slug
        WHERE p.slug = ${String(identifier)} OR p.sku ILIKE ${String(identifier)}
        LIMIT 1
      `;
    }
    if (!rows || rows.length === 0) return null;
    return formatProduct(rows[0]);
  } catch (err) {
    console.error('getOnlineProductBySlugOrId error:', err.message);
    return null;
  }
}

export async function toggleOnlineProductStatus(id, isActive) {
  const [row] = await sql`
    UPDATE products SET is_active = ${Boolean(isActive)} WHERE id = ${Number(id)} RETURNING *
  `;
  return row ? formatProduct(row) : null;
}

export async function updateOnlineProductFlags(id, flags) {
  const current = await sql`SELECT * FROM products WHERE id = ${Number(id)}`;
  if (!current || current.length === 0) return null;
  const p = current[0];

  const newActive = flags.isActive !== undefined ? Boolean(flags.isActive) : p.is_active;
  const newBestSeller = flags.isBestSeller !== undefined ? Boolean(flags.isBestSeller) : p.is_best_seller;
  const newNewArrival = flags.isNewArrival !== undefined ? Boolean(flags.isNewArrival) : p.is_new_arrival;
  const newTodaysDeal = flags.isTodaysDeal !== undefined ? Boolean(flags.isTodaysDeal) : p.is_todays_deal;

  const [row] = await sql`
    UPDATE products
    SET is_active = ${newActive},
        is_best_seller = ${newBestSeller},
        is_new_arrival = ${newNewArrival},
        is_todays_deal = ${newTodaysDeal}
    WHERE id = ${Number(id)}
    RETURNING *
  `;
  return row ? formatProduct(row) : null;
}

export async function createOnlineProduct(data) {
  const slug =
    (data.name || 'product')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Date.now().toString().slice(-4);

  const galleryJson = JSON.stringify(data.gallery || [data.primaryImage, data.hoverImage || data.primaryImage]);
  const inventoryType = data.inventoryType === 'single' ? 'single' : 'sizes';
  const threshold = Number(data.lowStockThreshold) || 5;

  // Standardize colors array with hierarchical sizes: Product -> Colour -> Sizes
  const rawColors = Array.isArray(data.colors) && data.colors.length > 0
    ? data.colors
    : [{ name: 'Standard', hex: '#212121', stock: Number(data.totalStock) || 25, sizes: [] }];

  const standardizedColors = rawColors.map((c) => {
    let cSizes = Array.isArray(c.sizes) ? c.sizes : [];
    if (inventoryType === 'single') {
      const cStock = Number(c.stock !== undefined ? c.stock : data.totalStock) || 25;
      cSizes = [{ size: 'ONE_SIZE', stock: cStock }];
    } else if (cSizes.length === 0) {
      cSizes = [
        { size: 'M', chest: '40', length: '28', stock: 10 },
        { size: 'L', chest: '42', length: '29', stock: 12 },
        { size: 'XL', chest: '44', length: '30', stock: 8 },
        { size: 'XXL', chest: '46', length: '31', stock: 5 }
      ];
    }
    const colorStock = cSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    return {
      name: c.name || 'Standard',
      hex: c.hex || '#212121',
      stock: colorStock,
      sizes: cSizes
    };
  });

  const totalStock = standardizedColors.reduce((sum, c) => sum + c.stock, 0);

  // Rollup aggregate sizes across all colors
  const sizeMap = {};
  standardizedColors.forEach((c) => {
    (c.sizes || []).forEach((s) => {
      if (!sizeMap[s.size]) {
        sizeMap[s.size] = { size: s.size, stock: 0, chest: s.chest || '42', length: s.length || '29' };
      }
      sizeMap[s.size].stock += Number(s.stock) || 0;
    });
  });
  const sizesJson = JSON.stringify(Object.values(sizeMap));
  const colorsJson = JSON.stringify(standardizedColors);

  const [row] = await sql`
    INSERT INTO products (
      name, slug, sku, category_slug, regular_price, sale_price,
      description, fabric, primary_image, hover_image, gallery,
      sizes, colors, rating, reviews_count, is_best_seller, is_new_arrival, is_todays_deal, is_active,
      total_stock, low_stock_threshold, inventory_type
    ) VALUES (
      ${data.name.trim()}, ${slug}, ${data.sku.trim().toUpperCase()}, ${data.categorySlug},
      ${Number(data.regularPrice)}, ${Number(data.salePrice)}, ${data.description || ''}, ${data.fabric || ''},
      ${data.primaryImage}, ${data.hoverImage || data.primaryImage},
      ${galleryJson}, ${sizesJson}, ${colorsJson},
      4.9, 12, ${Boolean(data.isBestSeller)}, ${Boolean(data.isNewArrival)}, ${Boolean(data.isTodaysDeal)},
      ${data.isActive !== false},
      ${totalStock}, ${threshold}, ${inventoryType}
    )
    RETURNING *
  `;

  // Log initial stock
  await sql`
    INSERT INTO inventory_logs (product_id, sku, color, size, change_amount, new_stock, reason, reference_id)
    VALUES (
      ${row.id}, ${row.sku}, 'ALL', 'INITIAL', ${totalStock}, ${totalStock}, 'product_created', 'NEW_SKU'
    )
  `;

  return formatProduct(row);
}

export async function updateProductStock(id, { totalStock, colors, sizes, lowStockThreshold, inventoryType }) {
  const current = await sql`SELECT * FROM products WHERE id = ${Number(id)}`;
  if (!current || current.length === 0) return null;
  const prod = current[0];

  const newThreshold = Number(lowStockThreshold) || Number(prod.low_stock_threshold) || 5;
  const newType = inventoryType || prod.inventory_type || 'sizes';
  let rawColors = colors || (typeof prod.colors === 'string' ? JSON.parse(prod.colors) : prod.colors);

  let newTotal = 0;
  let newSizes = sizes || [];

  if (Array.isArray(rawColors) && rawColors.length > 0) {
    const updatedColors = rawColors.map((c) => {
      let cSizes = Array.isArray(c.sizes) ? c.sizes : [];
      if (newType === 'single' && cSizes.length === 0) {
        cSizes = [{ size: 'ONE_SIZE', stock: Number(c.stock) || 0 }];
      }
      const cStock = cSizes.length > 0
        ? cSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)
        : (Number(c.stock) || 0);
      return {
        name: c.name || 'Standard',
        hex: c.hex || '#212121',
        stock: cStock,
        sizes: cSizes
      };
    });

    newTotal = updatedColors.reduce((sum, c) => sum + c.stock, 0);

    const sizeMap = {};
    updatedColors.forEach((c) => {
      (c.sizes || []).forEach((s) => {
        if (!sizeMap[s.size]) {
          sizeMap[s.size] = { size: s.size, stock: 0, chest: s.chest, length: s.length };
        }
        sizeMap[s.size].stock += Number(s.stock) || 0;
      });
    });
    newSizes = Object.values(sizeMap);
    rawColors = updatedColors;
  } else {
    newTotal = Number(totalStock) || 0;
  }

  const [row] = await sql`
    UPDATE products
    SET total_stock = ${newTotal},
        colors = ${JSON.stringify(rawColors)},
        sizes = ${JSON.stringify(newSizes)},
        low_stock_threshold = ${newThreshold},
        inventory_type = ${newType}
    WHERE id = ${Number(id)}
    RETURNING *
  `;

  await sql`
    INSERT INTO inventory_logs (product_id, sku, color, size, change_amount, new_stock, reason, reference_id)
    VALUES (
      ${prod.id}, ${prod.sku}, 'ALL', 'ALL', ${newTotal - (Number(prod.total_stock) || 0)},
      ${newTotal}, 'manual_admin_update', 'ADMIN_STOCK_EDIT'
    )
  `;

  return formatProduct(row);
}

export async function quickAdjustProductStock(id, { color, size, changeAmount, reason = 'manual_restock' }) {
  const current = await sql`SELECT * FROM products WHERE id = ${Number(id)}`;
  if (!current || current.length === 0) return null;
  const prod = current[0];
  const delta = Number(changeAmount) || 0;

  let rawColors = typeof prod.colors === 'string' ? JSON.parse(prod.colors) : (prod.colors || []);
  let rawSizes = typeof prod.sizes === 'string' ? JSON.parse(prod.sizes) : (prod.sizes || []);
  const invType = prod.inventory_type || 'sizes';

  if (!rawColors || rawColors.length === 0) {
    rawColors = [{ name: 'Standard', hex: '#212121', stock: Number(prod.total_stock) || 0, sizes: rawSizes }];
  }

  // Find target color
  let targetColor = color
    ? rawColors.find((c) => c.name.toLowerCase() === color.toLowerCase())
    : rawColors[0];
  if (!targetColor) {
    targetColor = rawColors[0];
  }

  let targetSize = size || (invType === 'single' ? 'ONE_SIZE' : 'ALL');

  if (invType === 'single' || size === 'ONE_SIZE') {
    targetColor.stock = Math.max(0, (Number(targetColor.stock) || 0) + delta);
    if (!Array.isArray(targetColor.sizes) || targetColor.sizes.length === 0) {
      targetColor.sizes = [{ size: 'ONE_SIZE', stock: targetColor.stock }];
    } else {
      targetColor.sizes[0].stock = targetColor.stock;
    }
  } else if (size === 'ALL') {
    if (Array.isArray(targetColor.sizes)) {
      targetColor.sizes.forEach((s) => {
        s.stock = Math.max(0, (Number(s.stock) || 0) + delta);
      });
      targetColor.stock = targetColor.sizes.reduce((sum, s) => sum + s.stock, 0);
    }
  } else {
    if (!Array.isArray(targetColor.sizes)) {
      targetColor.sizes = rawSizes.map((s) => ({ ...s, stock: 0 }));
    }
    const matched = targetColor.sizes.find((s) => s.size === size);
    if (matched) {
      matched.stock = Math.max(0, (Number(matched.stock) || 0) + delta);
    } else {
      targetColor.sizes.push({ size, stock: Math.max(0, delta) });
    }
    targetColor.stock = targetColor.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
  }

  // Recalculate grand total
  const newTotal = rawColors.reduce((sum, c) => {
    if (Array.isArray(c.sizes) && c.sizes.length > 0) {
      return sum + c.sizes.reduce((sSum, s) => sSum + (Number(s.stock) || 0), 0);
    }
    return sum + (Number(c.stock) || 0);
  }, 0);

  // Recalculate size rollup
  const sizeRollup = {};
  rawColors.forEach((c) => {
    (c.sizes || []).forEach((s) => {
      if (!sizeRollup[s.size]) {
        sizeRollup[s.size] = { size: s.size, stock: 0, chest: s.chest, length: s.length };
      }
      sizeRollup[s.size].stock += Number(s.stock) || 0;
    });
  });
  const updatedSizes = Object.values(sizeRollup);

  await sql`
    UPDATE products
    SET colors = ${JSON.stringify(rawColors)},
        sizes = ${JSON.stringify(updatedSizes.length > 0 ? updatedSizes : rawSizes)},
        total_stock = ${newTotal}
    WHERE id = ${prod.id}
  `;

  await sql`
    INSERT INTO inventory_logs (product_id, sku, color, size, change_amount, new_stock, reason, reference_id)
    VALUES (
      ${prod.id}, ${prod.sku}, ${targetColor?.name || 'Standard'}, ${targetSize}, ${delta},
      ${newTotal}, ${reason}, 'QUICK_RESTOCK'
    )
  `;

  const [updated] = await sql`SELECT * FROM products WHERE id = ${prod.id}`;
  return formatProduct(updated);
}

export async function getInventorySummary() {
  try {
    const rows = await sql`
      SELECT 
        COALESCE(SUM(total_stock), 0) as total_units,
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE total_stock > low_stock_threshold) as in_stock_count,
        COUNT(*) FILTER (WHERE total_stock > 0 AND total_stock <= low_stock_threshold) as low_stock_count,
        COUNT(*) FILTER (WHERE total_stock <= 0) as sold_out_count,
        COALESCE(SUM(sale_price * total_stock), 0) as estimated_value
      FROM products
    `;

    const recentLogs = await sql`
      SELECT * FROM inventory_logs ORDER BY id DESC LIMIT 25
    `;

    return {
      summary: {
        totalUnits: Number(rows[0]?.total_units || 0),
        totalProducts: Number(rows[0]?.total_products || 0),
        inStockCount: Number(rows[0]?.in_stock_count || 0),
        lowStockCount: Number(rows[0]?.low_stock_count || 0),
        soldOutCount: Number(rows[0]?.sold_out_count || 0),
        estimatedValue: Number(rows[0]?.estimated_value || 0)
      },
      recentLogs
    };
  } catch (err) {
    console.error('getInventorySummary error:', err.message);
    return {
      summary: {
        totalUnits: 0,
        totalProducts: 0,
        inStockCount: 0,
        lowStockCount: 0,
        soldOutCount: 0,
        estimatedValue: 0
      },
      recentLogs: []
    };
  }
}

export async function deleteOnlineProduct(id) {
  await sql`DELETE FROM products WHERE id = ${Number(id)}`;
  return true;
}

/* ========================================================
   4. ORDERS CRUD
   ======================================================== */
export async function getOnlineOrders({ phone } = {}) {
  try {
    let rows;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      rows = await sql`
        SELECT * FROM orders
        WHERE regexp_replace(customer_phone, '\\D', '', 'g') LIKE ${'%' + cleanPhone + '%'}
        ORDER BY id DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM orders ORDER BY id DESC LIMIT 100
      `;
    }
    return rows.map(r => ({
      id: r.id,
      orderNumber: r.order_number,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      shippingAddress: r.shipping_address,
      deliveryZone: r.delivery_zone,
      deliveryCharge: Number(r.delivery_charge),
      subtotal: Number(r.subtotal),
      discount: Number(r.discount),
      totalAmount: Number(r.total_amount),
      paymentMethod: r.payment_method,
      paymentNumber: r.payment_number,
      transactionId: r.transaction_id,
      status: r.status,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
      notes: r.notes,
      createdAt: r.created_at
    }));
  } catch (err) {
    console.error('getOnlineOrders error:', err.message);
    return [];
  }
}

export async function createOnlineOrder(orderData) {
  // Pre-validate stock availability for exact (Product -> Colour -> Size)
  for (const item of orderData.items) {
    try {
      const [prod] = await sql`SELECT id, name, total_stock, inventory_type, colors, sizes FROM products WHERE id = ${Number(item.productId)}`;
      if (prod) {
        const qty = Number(item.quantity) || 1;
        const rawColors = typeof prod.colors === 'string' ? JSON.parse(prod.colors) : prod.colors || [];
        const colorObj = item.color
          ? rawColors.find((c) => c.name.toLowerCase() === item.color.toLowerCase())
          : rawColors[0];

        if (colorObj) {
          if (prod.inventory_type === 'single' || item.size === 'ONE_SIZE') {
            const avail = Number(colorObj.stock !== undefined ? colorObj.stock : prod.total_stock) || 0;
            if (avail < qty) {
              throw new Error(`Insufficient stock for "${prod.name}" (${colorObj.name}). Only ${avail} unit(s) remaining.`);
            }
          } else if (Array.isArray(colorObj.sizes)) {
            const matched = colorObj.sizes.find((s) => s.size === item.size);
            if (matched && Number(matched.stock) < qty) {
              throw new Error(`Insufficient stock for "${prod.name}" (${colorObj.name} - Size ${item.size}). Only ${matched.stock} unit(s) remaining.`);
            }
          }
        } else if (prod.inventory_type === 'single') {
          if (Number(prod.total_stock) < qty) {
            throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.total_stock} unit(s) remaining.`);
          }
        }
      }
    } catch (valErr) {
      if (valErr.message.startsWith('Insufficient stock')) {
        throw valErr;
      }
    }
  }

  const countRow = await sql`SELECT count(*) as count FROM orders`;
  const nextNum = 1001 + Number(countRow[0]?.count || 0);
  const orderNumber = `VV-2026-${nextNum}`;

  const deliveryCharge = orderData.deliveryZone === 'Inside Dhaka' ? 60 : 120;
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const totalAmount = subtotal + deliveryCharge;
  const itemsJson = JSON.stringify(orderData.items);

  const [row] = await sql`
    INSERT INTO orders (
      order_number, customer_name, customer_phone, customer_email,
      shipping_address, delivery_zone, delivery_charge, subtotal, discount, total_amount,
      payment_method, payment_number, transaction_id, status, items, notes
    ) VALUES (
      ${orderNumber}, ${orderData.customerName}, ${orderData.customerPhone},
      ${orderData.customerEmail || ''}, ${orderData.shippingAddress},
      ${orderData.deliveryZone || 'Inside Dhaka'}, ${deliveryCharge}, ${subtotal},
      0, ${totalAmount}, ${orderData.paymentMethod || 'Cash on Delivery'},
      ${orderData.paymentNumber || ''}, ${orderData.transactionId || ''},
      'pending', ${itemsJson}, ${orderData.notes || ''}
    )
    RETURNING *
  `;

  // Decrement inventory in Neon atomically per (Product -> Colour -> Size)
  for (const item of orderData.items) {
    try {
      const [prod] = await sql`SELECT id, sku, total_stock, inventory_type, colors, sizes FROM products WHERE id = ${item.productId}`;
      if (prod) {
        let rawColors = typeof prod.colors === 'string' ? JSON.parse(prod.colors) : prod.colors || [];
        let rawSizes = typeof prod.sizes === 'string' ? JSON.parse(prod.sizes) : prod.sizes || [];
        const qty = Number(item.quantity) || 1;
        const colorName = item.color || rawColors[0]?.name || 'Standard';

        let targetColor = rawColors.find((c) => c.name.toLowerCase() === colorName.toLowerCase()) || rawColors[0];
        if (targetColor) {
          if (prod.inventory_type === 'single' || item.size === 'ONE_SIZE') {
            targetColor.stock = Math.max(0, (Number(targetColor.stock) || 0) - qty);
            if (Array.isArray(targetColor.sizes) && targetColor.sizes.length > 0) {
              targetColor.sizes[0].stock = targetColor.stock;
            }
          } else if (Array.isArray(targetColor.sizes)) {
            const matched = targetColor.sizes.find((s) => s.size === item.size);
            if (matched) {
              matched.stock = Math.max(0, (Number(matched.stock) || 0) - qty);
            }
            targetColor.stock = targetColor.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
          }
        }

        // Recalculate grand total
        const newTotal = rawColors.reduce((sum, c) => {
          if (Array.isArray(c.sizes) && c.sizes.length > 0) {
            return sum + c.sizes.reduce((sSum, s) => sSum + (Number(s.stock) || 0), 0);
          }
          return sum + (Number(c.stock) || 0);
        }, 0);

        // Recalculate size rollup
        const sizeRollup = {};
        rawColors.forEach((c) => {
          (c.sizes || []).forEach((s) => {
            if (!sizeRollup[s.size]) {
              sizeRollup[s.size] = { size: s.size, stock: 0, chest: s.chest, length: s.length };
            }
            sizeRollup[s.size].stock += Number(s.stock) || 0;
          });
        });
        const updatedSizes = Object.values(sizeRollup);

        await sql`
          UPDATE products
          SET colors = ${JSON.stringify(rawColors)},
              sizes = ${JSON.stringify(updatedSizes.length > 0 ? updatedSizes : rawSizes)},
              total_stock = ${newTotal}
          WHERE id = ${prod.id}
        `;

        // Log audit trail with color and size
        await sql`
          INSERT INTO inventory_logs (product_id, sku, color, size, change_amount, new_stock, reason, reference_id)
          VALUES (
            ${prod.id}, ${prod.sku}, ${targetColor?.name || 'Standard'}, ${item.size || 'ONE_SIZE'}, ${-qty},
            ${newTotal}, 'order_placed', ${orderNumber}
          )
        `;
      }
    } catch (e) {
      console.warn('Inventory decrement skipped:', e.message);
    }
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    shippingAddress: row.shipping_address,
    deliveryZone: row.delivery_zone,
    deliveryCharge: Number(row.delivery_charge),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    status: row.status,
    items: orderData.items,
    createdAt: row.created_at
  };
}

export async function updateOnlineOrderStatus(id, status) {
  const currentOrders = await sql`SELECT * FROM orders WHERE id = ${Number(id)}`;
  if (!currentOrders || currentOrders.length === 0) return null;
  const prevStatus = currentOrders[0].status;

  const [row] = await sql`
    UPDATE orders SET status = ${status} WHERE id = ${Number(id)} RETURNING *
  `;

  // If order was cancelled and previous status was not cancelled, restore inventory automatically!
  if (status === 'cancelled' && prevStatus !== 'cancelled') {
    try {
      const items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [];
      for (const item of items) {
        const [prod] = await sql`SELECT id, sku, total_stock, inventory_type, colors, sizes FROM products WHERE id = ${item.productId}`;
        if (prod) {
          let rawColors = typeof prod.colors === 'string' ? JSON.parse(prod.colors) : prod.colors || [];
          let rawSizes = typeof prod.sizes === 'string' ? JSON.parse(prod.sizes) : prod.sizes || [];
          const qty = Number(item.quantity) || 1;
          const colorName = item.color || rawColors[0]?.name || 'Standard';

          let targetColor = rawColors.find((c) => c.name.toLowerCase() === colorName.toLowerCase()) || rawColors[0];
          if (targetColor) {
            if (prod.inventory_type === 'single' || item.size === 'ONE_SIZE') {
              targetColor.stock = (Number(targetColor.stock) || 0) + qty;
              if (Array.isArray(targetColor.sizes) && targetColor.sizes.length > 0) {
                targetColor.sizes[0].stock = targetColor.stock;
              }
            } else if (Array.isArray(targetColor.sizes)) {
              const matched = targetColor.sizes.find((s) => s.size === item.size);
              if (matched) {
                matched.stock = (Number(matched.stock) || 0) + qty;
              }
              targetColor.stock = targetColor.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
            }
          }

          const newTotal = rawColors.reduce((sum, c) => {
            if (Array.isArray(c.sizes) && c.sizes.length > 0) {
              return sum + c.sizes.reduce((sSum, s) => sSum + (Number(s.stock) || 0), 0);
            }
            return sum + (Number(c.stock) || 0);
          }, 0);

          const sizeRollup = {};
          rawColors.forEach((c) => {
            (c.sizes || []).forEach((s) => {
              if (!sizeRollup[s.size]) {
                sizeRollup[s.size] = { size: s.size, stock: 0, chest: s.chest, length: s.length };
              }
              sizeRollup[s.size].stock += Number(s.stock) || 0;
            });
          });
          const updatedSizes = Object.values(sizeRollup);

          await sql`
            UPDATE products
            SET colors = ${JSON.stringify(rawColors)},
                sizes = ${JSON.stringify(updatedSizes.length > 0 ? updatedSizes : rawSizes)},
                total_stock = ${newTotal}
            WHERE id = ${prod.id}
          `;

          await sql`
            INSERT INTO inventory_logs (product_id, sku, color, size, change_amount, new_stock, reason, reference_id)
            VALUES (
              ${prod.id}, ${prod.sku}, ${targetColor?.name || 'Standard'}, ${item.size || 'ONE_SIZE'}, ${qty},
              ${newTotal}, 'order_cancelled', ${row.order_number}
            )
          `;
        }
      }
    } catch (err) {
      console.warn('Inventory restore on order cancel failed:', err.message);
    }
  }

  return row;
}
