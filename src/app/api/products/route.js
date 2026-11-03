import { NextResponse } from 'next/server';
import {
  getOnlineProducts,
  getOnlineProductBySlugOrId,
  getOnlineCategories,
  getOnlineHeroSlides,
  getOnlinePromoBlocks,
  createOnlineProduct,
  deleteOnlineProduct,
  updateOnlineProductFlags
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug || id) {
      let product = await getOnlineProductBySlugOrId(slug || id);
      if (!product) {
        const { INITIAL_PRODUCTS } = await import('@/lib/initialData');
        const match = INITIAL_PRODUCTS.find(
          (p) => p.slug === (slug || id) || String(p.id) === String(slug || id) || p.sku === (slug || id)
        );
        if (match) {
          product = match;
        }
      }

      if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }

      const res = NextResponse.json({ product });
      res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=86400');
      res.headers.set('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      res.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      return res;
    }

    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase() || '';
    const wantsAdmin = searchParams.get('admin') === 'true' || searchParams.get('all') === 'true';
    const includeInactive = wantsAdmin && verifyAdminSession(request);

    let [products, categories, heroSlides, promoBlocks] = await Promise.all([
      getOnlineProducts({ category, search, includeInactive }),
      getOnlineCategories({ includeInactive }),
      getOnlineHeroSlides({ includeInactive }),
      getOnlinePromoBlocks({ includeInactive })
    ]);

    // Resilient fallback for public traffic if database cold-start or temporary timeout occurs
    if (!includeInactive) {
      if ((!products || products.length === 0) && !search && (!category || category === 'all')) {
        const { INITIAL_PRODUCTS } = await import('@/lib/initialData');
        products = INITIAL_PRODUCTS;
      }
      if (!categories || categories.length === 0) {
        const { INITIAL_CATEGORIES } = await import('@/lib/initialData');
        categories = INITIAL_CATEGORIES;
      }
      if (!heroSlides || heroSlides.length === 0) {
        const { INITIAL_HERO_SLIDES } = await import('@/lib/initialData');
        heroSlides = INITIAL_HERO_SLIDES;
      }
    }

    const res = NextResponse.json({
      products: products || [],
      categories: categories || [],
      heroSlides: heroSlides || [],
      promoBlocks: promoBlocks || []
    });

    if (wantsAdmin) {
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
      res.headers.set('CDN-Cache-Control', 'public, s-maxage=180, stale-while-revalidate=86400');
      res.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=180, stale-while-revalidate=86400');
    }

    return res;
  } catch (err) {
    // If DB completely hangs or errors, serve initial fallback for public users
    try {
      const { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_HERO_SLIDES } = await import('@/lib/initialData');
      const fallbackRes = NextResponse.json({
        products: INITIAL_PRODUCTS,
        categories: INITIAL_CATEGORIES,
        heroSlides: INITIAL_HERO_SLIDES,
        promoBlocks: []
      });
      fallbackRes.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
      return fallbackRes;
    } catch {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  }
}

export async function POST(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const product = await createOnlineProduct(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...flags } = body;
    if (!id) {
      return NextResponse.json({ message: 'Product ID required.' }, { status: 400 });
    }
    const product = await updateOnlineProductFlags(id, flags);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    await deleteOnlineProduct(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
