import { NextResponse } from 'next/server';
import {
  getOnlineHeroSlides,
  createOnlineHeroSlide,
  deleteOnlineHeroSlide,
  toggleOnlineHeroSlideStatus,
  getOnlinePromoBlocks,
  createOnlinePromoBlock,
  deleteOnlinePromoBlock,
  toggleOnlinePromoBlockStatus
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const wantsAdmin = searchParams.get('admin') === 'true' || searchParams.get('all') === 'true';
    const includeInactive = wantsAdmin && verifyAdminSession(request);

    if (type === 'hero') {
      const heroSlides = await getOnlineHeroSlides({ includeInactive });
      return NextResponse.json({ heroSlides });
    }

    if (type === 'promo') {
      const promoBlocks = await getOnlinePromoBlocks({ includeInactive });
      return NextResponse.json({ promoBlocks });
    }

    const [heroSlides, promoBlocks] = await Promise.all([
      getOnlineHeroSlides({ includeInactive }),
      getOnlinePromoBlocks({ includeInactive })
    ]);

    return NextResponse.json({ heroSlides, promoBlocks });
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
    const { type, ...data } = body;

    if (type === 'hero') {
      if (!data.title || !data.imageUrl) {
        return NextResponse.json(
          { message: 'Hero slide title and image URL are required.' },
          { status: 400 }
        );
      }
      const slide = await createOnlineHeroSlide(data);
      return NextResponse.json({ slide }, { status: 201 });
    }

    if (type === 'promo') {
      if (!data.title || !data.imageUrl) {
        return NextResponse.json(
          { message: 'Promo block title and image URL are required.' },
          { status: 400 }
        );
      }
      const block = await createOnlinePromoBlock(data);
      return NextResponse.json({ block }, { status: 201 });
    }

    return NextResponse.json({ message: 'Invalid banner type specified.' }, { status: 400 });
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
    const { type, id, isActive } = body;

    if (!id) {
      return NextResponse.json({ message: 'Valid ID required.' }, { status: 400 });
    }

    if (type === 'hero') {
      const slide = await toggleOnlineHeroSlideStatus(id, isActive);
      return NextResponse.json({ slide });
    }

    if (type === 'promo') {
      const block = await toggleOnlinePromoBlockStatus(id, isActive);
      return NextResponse.json({ block });
    }

    return NextResponse.json({ message: 'Specify type=hero or type=promo' }, { status: 400 });
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
    const type = searchParams.get('type');
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ message: 'Valid ID required.' }, { status: 400 });
    }

    if (type === 'hero') {
      await deleteOnlineHeroSlide(id);
      return NextResponse.json({ success: true });
    }

    if (type === 'promo') {
      await deleteOnlinePromoBlock(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Specify type=hero or type=promo' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
