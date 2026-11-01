'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { Sparkles, Clock, Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface HomeShowcaseProps {
  featuredProducts: Product[];
  latestProducts: Product[];
  discountedProducts: Product[];
}

export default function HomeShowcase({
  featuredProducts,
  latestProducts,
  discountedProducts,
}: HomeShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'featured' | 'latest' | 'offers'>('featured');

  const getActiveProducts = () => {
    if (activeTab === 'offers') {
      return discountedProducts;
    }
    if (activeTab === 'latest') {
      return latestProducts;
    }
    return featuredProducts;
  };

  const activeProducts = getActiveProducts();

  return (
    <section className="space-y-6">
      {/* رأس القسم: فقط العنوان "المنتجات المميزة" بدون أيقونة وبدون عنوان فرعي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--color-primary)] tracking-tight">
            المنتجات المميزة
          </h3>
        </div>

        {/* أزرار التبويب التفاعلية (Tabs) */}
        <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-2xl border border-gray-200/80 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'featured'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>الأكثر طلباً</span>
            {featuredProducts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
                {featuredProducts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('latest')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'latest'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>وصل حديثاً</span>
            {latestProducts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
                {latestProducts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>العروض</span>
            {discountedProducts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
                {discountedProducts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* شبكة المنتجات النشطة */}
      {activeProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeProducts.map((product) => (
            <ProductCard key={product.$id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-gray-500 bg-gray-50/70 rounded-3xl border border-gray-200/80 space-y-1">
          <p className="font-bold text-sm text-gray-700">
            {activeTab === 'offers' && 'لا توجد منتجات مسجلة في العروض حالياً.'}
            {activeTab === 'featured' && 'لم يتم تحديد أي منتج كـ "أكثر طلباً / مميز" من لوحة التحكم بعد.'}
            {activeTab === 'latest' && 'لا توجد منتجات مضافة حديثاً حالياً.'}
          </p>
          <p className="text-xs text-gray-400">
            {activeTab === 'featured' && 'يمكنك تعيين المنتجات المميزة بالدخول إلى لوحة التحكم > المنتجات وتفعيل خيار (منتج مميز).'}
            {activeTab === 'offers' && 'يمكنك إضافة منتج للعروض بتفعيل خيار (عرض خاص) أو كتابة سعر قبل الخصم.'}
          </p>
        </div>
      )}

      {/* زر عرض كافة المنتجات */}
      <div className="flex justify-center pt-2">
        <Link
          href="/products"
          className="btn btn-secondary text-xs sm:text-sm font-extrabold px-8 py-3 rounded-2xl gap-2 shadow-sm hover:border-[var(--color-primary)] transition"
        >
          <span>عرض جميع منتجات المتجر</span>
          <ArrowLeft className="w-4 h-4 text-[var(--color-primary)]" />
        </Link>
      </div>
    </section>
  );
}
