'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function OAuthFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-gray-900">تعذر تسجيل الدخول عبر Google</h2>
        <p className="text-xs text-gray-500">تم إلغاء عملية تسجيل الدخول أو حدث خطأ أثناء الاتصال بالمزود.</p>
        <div className="pt-2">
          <Link
            href="/account"
            className="inline-block px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl"
          >
            العودة لصفحة الحساب
          </Link>
        </div>
      </div>
    </div>
  );
}
