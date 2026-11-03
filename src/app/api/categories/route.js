import { NextResponse } from 'next/server';
import {
  getOnlineCategories,
  createOnlineCategory,
  deleteOnlineCategory,
  toggleOnlineCategoryStatus
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantsAdmin = searchParams.get('admin') === 'true' || searchParams.get('all') === 'true';
    const includeInactive = wantsAdmin && verifyAdminSession(request);
    let categories = await getOnlineCategories({ includeInactive });

    if (!includeInactive && (!categories || categories.length === 0)) {
      const { INITIAL_CATEGORIES } = await import('@/lib/initialData');
      categories = INITIAL_CATEGORIES;
    }

    const res = NextResponse.json({ categories: categories || [] });
    if (wantsAdmin) {
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      res.headers.set('CDN-Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
      res.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    }
    return res;
  } catch (err) {
    try {
      const { INITIAL_CATEGORIES } = await import('@/lib/initialData');
      return NextResponse.json({ categories: INITIAL_CATEGORIES });
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
    if (!body.name || !body.cardImage) {
      return NextResponse.json(
        { message: 'Category name and card image URL are required.' },
        { status: 400 }
      );
    }
    const category = await createOnlineCategory(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive } = body;
    if (!id) {
      return NextResponse.json({ message: 'Category ID required.' }, { status: 400 });
    }
    const updated = await toggleOnlineCategoryStatus(id, isActive);
    return NextResponse.json({ category: updated });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
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
    if (!id) {
      return NextResponse.json({ message: 'Valid category ID required.' }, { status: 400 });
    }
    await deleteOnlineCategory(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
