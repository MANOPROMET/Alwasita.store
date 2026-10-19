'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartIcon() {
  const { totalCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition flex items-center justify-center"
      aria-label="سلة المشتريات"
    >
      <ShoppingBag className="w-5 h-5 text-gray-800" />
      {totalCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          {totalCount}
        </span>
      )}
    </Link>
  );
}