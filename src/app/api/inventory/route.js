import { NextResponse } from 'next/server';
import {
  getInventorySummary,
  quickAdjustProductStock,
  updateProductStock
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized. Administrative credentials required.' },
        { status: 401 }
      );
    }

    const data = await getInventorySummary();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized. Administrative credentials required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, productId } = body;

    if (!productId && action !== 'bulk_restock') {
      return NextResponse.json({ message: 'Product ID required.' }, { status: 400 });
    }

    if (action === 'quick_adjust') {
      const { color, size, changeAmount, reason } = body;
      const updated = await quickAdjustProductStock(productId, {
        color,
        size,
        changeAmount,
        reason: reason || 'manual_restock'
      });
      const summaryData = await getInventorySummary();
      return NextResponse.json({ product: updated, ...summaryData });
    }

    if (action === 'update_stock') {
      const { totalStock, colors, sizes, lowStockThreshold, inventoryType } = body;
      const updated = await updateProductStock(productId, {
        totalStock,
        colors,
        sizes,
        lowStockThreshold,
        inventoryType
      });
      const summaryData = await getInventorySummary();
      return NextResponse.json({ product: updated, ...summaryData });
    }

    if (action === 'bulk_restock') {
      const { items } = body; // [{ productId, color, size, changeAmount }]
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ message: 'No items provided for bulk restock.' }, { status: 400 });
      }
      for (const item of items) {
        await quickAdjustProductStock(item.productId, {
          color: item.color,
          size: item.size,
          changeAmount: item.changeAmount,
          reason: 'factory_bulk_restock'
        });
      }
      const summaryData = await getInventorySummary();
      return NextResponse.json({ success: true, ...summaryData });
    }

    return NextResponse.json({ message: 'Invalid action provided.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
