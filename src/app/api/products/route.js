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
      const product = await getOnlineProductBySlugOrId(slug || id);
      if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase() || '';
    const wantsAdmin = searchParams.get('admin') === 'true' || searchParams.get('all') === 'true';
    const includeInactive = wantsAdmin && verifyAdminSession(request);

    const [products, categories, heroSlides, promoBlocks] = await Promise.all([
      getOnlineProducts({ category, search, includeInactive }),
      getOnlineCategories({ includeInactive }),
      getOnlineHeroSlides({ includeInactive }),
      getOnlinePromoBlocks({ includeInactive })
    ]);

    return NextResponse.json({
      products,
      categories,
      heroSlides,
      promoBlocks
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
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
