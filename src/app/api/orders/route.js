import { NextResponse } from 'next/server';
import {
  getOnlineOrders,
  createOnlineOrder,
  updateOnlineOrderStatus
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  // If no phone parameter, this is an admin request to list all orders
  if (!phone) {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized. Administrative credentials required to view full order log.' },
        { status: 401 }
      );
    }
    const orders = await getOnlineOrders({ phone: null });
    return NextResponse.json({ orders });
  }

  // Customer tracking by exact phone number
  const cleanPhone = phone.trim();
  if (cleanPhone.length < 6) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await getOnlineOrders({ phone: cleanPhone });
  return NextResponse.json({ orders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, shippingAddress, items } = body;

    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Name, phone number, delivery address, and items are required.' },
        { status: 400 }
      );
    }

    const order = await createOnlineOrder(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized. Administrative credentials required to update order status.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;
    const order = await updateOnlineOrderStatus(id, status);
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
