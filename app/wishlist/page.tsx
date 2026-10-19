// app/wishlist/page.tsx
'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/app/components/ProductCard';
import { Heart, ChevronLeft, ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, wishlistCount, clearWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      
      {/* 1. مسار التصفح (Breadcrumb) */}
      <div className="bg-white border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">المنتجات المفضلة</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* رأس الصفحة مع العداد وزر الإفراغ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                قائمة المنتجات المفضلة
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              المنتجات التي نالت إعجابك وحفظتها للرجوع إليها وطلبها بسهولة.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-50 text-primary-700 border border-purple-200">
                {wishlistCount} {wishlistCount === 1 ? 'منتج محفوظ' : 'منتجات محفوظة'}
              </span>

              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs font-bold text-gray-500 hover:text-red-600 transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 border border-gray-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إفراغ المفضلة</span>
              </button>
            </div>
          )}
        </div>

        {/* شبكة المنتجات المفضلة */}
        {wishlistCount > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.$id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-gray-200/80 shadow-xs max-w-xl mx-auto space-y-5">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
              <Heart className="w-10 h-10 stroke-1" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                قائمة المفضلة فارغة حالياً
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                اضغط على أيقونة القلب على أي منتج يعجبك أثناء تصفح المتجر لتجده محفوظاً هنا دائماً.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="btn btn-primary px-8 py-3 rounded-2xl text-xs sm:text-sm font-extrabold gap-2 inline-flex items-center shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>استكشف منتجات المتجر الآن</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
