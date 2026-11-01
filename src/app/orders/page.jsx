'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageSearch, FileDown, ArrowLeft, Phone, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { generateOrderInvoice } from '@/utils/invoiceGenerator';

export default function OrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOrders = async (searchPhone = '') => {
    const clean = (searchPhone || '').trim();
    if (!clean || clean.length < 6) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const url = `/api/orders?phone=${encodeURIComponent(clean)}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3eb] text-[#3d2b1f]">
      <Navbar />

      <main className="flex-1 max-w-[1150px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-wider text-[#3d2b1f]">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-base text-[#6e5d52] mt-1.5">
              Enter your 11-digit mobile number to check live courier dispatch status and download your invoice.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-display uppercase tracking-wider px-4 py-2 rounded-lg border border-[#e3ded3] bg-[#fcfbf7] text-[#3d2b1f] hover:border-[#a8825b] hover:text-[#a8825b] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>

        {/* Search by Phone Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrders(phone);
          }}
          className="bg-[#fcfbf7] p-4 sm:p-5 rounded-2xl shadow-xs border border-[#e3ded3] flex flex-col sm:flex-row gap-3 mb-8"
        >
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            placeholder="Enter your 11-digit mobile number (e.g. 01711223344)..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 bg-[#fcfbf7] border border-[#e3ded3] rounded-xl px-4 py-3 text-base text-[#3d2b1f] focus:border-[#a8825b] focus:outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="bg-[#4e3828] hover:bg-[#3e2b1f] text-white px-8 py-3 rounded-xl font-display uppercase tracking-widest text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
          >
            <PackageSearch className="w-5 h-5" />
            Track Orders
          </button>
        </form>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16 text-base text-gray-500">Querying live orders...</div>
        ) : !hasSearched ? (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-10 sm:p-14 text-center shadow-xs">
            <PackageSearch className="w-12 h-12 text-[#a8825b] mx-auto mb-3 opacity-80" />
            <p className="font-display text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f]">
              Ready to Track
            </p>
            <p className="text-xs sm:text-sm text-[#6e5d52] mt-1.5 max-w-sm mx-auto">
              Please enter the mobile number used when placing your Cash on Delivery order to view dispatch status.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-10 sm:p-14 text-center shadow-xs">
            <p className="font-display text-lg sm:text-xl uppercase tracking-wider text-[#3d2b1f]">
              No Orders Found for {phone}
            </p>
            <p className="text-xs sm:text-sm text-[#6e5d52] mt-1.5">
              Check that your mobile number is correct or place an order from our catalog.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#fcfbf7] rounded-2xl border border-[#e3ded3] p-6 sm:p-7 shadow-xs space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e3ded3] pb-4">
                  <div>
                    <span className="text-xs font-mono text-[#6e5d52]">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-[#3d2b1f]">
                      Order #{order.orderNumber || order.id} — {order.customerName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-display uppercase tracking-wider font-bold ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-50 border border-rose-300 text-rose-800'
                          : 'bg-[#faf3eb] border border-[#d0a876]/40 text-[#a8825b]'
                      }`}
                    >
                      {order.status}
                    </span>

                    <button
                      onClick={() => generateOrderInvoice(order)}
                      className="inline-flex items-center gap-1.5 bg-[#4e3828] text-white hover:bg-[#3e2b1f] px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider font-bold cursor-pointer transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF Invoice
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#6e5d52]">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#a8825b]" />
                    <span><strong>Phone:</strong> {order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#a8825b]" />
                    <span><strong>Address:</strong> {order.shippingAddress} ({order.deliveryZone})</span>
                  </div>
                  <div className="md:text-right font-display text-lg font-bold text-[#3d2b1f]">
                    Total: TK. {Number(order.totalAmount).toLocaleString()} ({order.paymentMethod})
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 p-3 rounded-xl border border-[#e3ded3] bg-[#ede8dc]"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-16 object-cover rounded-lg border border-[#e3ded3] shrink-0"
                        />
                      )}
                      <div className="text-xs sm:text-sm">
                        <p className="font-semibold text-[#3d2b1f] line-clamp-1">{item.name}</p>
                        <p className="text-[#6e5d52]">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                        <p className="font-display font-bold text-[#3d2b1f] mt-0.5">
                          TK. {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
