'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import CurrencySelector from './CurrencySelector';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalCount, isCartPulsing } = useCart();
  const { wishlistCount, isWishlistPulsing } = useWishlist();
  const { user } = useAuth();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="bg-white shadow-xs sticky top-0 z-50 w-full border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">

        {/* الشريط الرئيسي */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">

          {/* الشعار واسم المتجر بالخط والتنسيق الأصلي */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            <Image
              src="/mylogo.png"
              alt="متجر الواسطة"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              priority
            />

            <span className="store-name text-base sm:text-xl">
              متجر <span>الواسطة</span>
            </span>
          </Link>

          {/* القائمة الرئيسية - شاشات الكمبيوتر */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link href="/" className="header-link">
              الرئيسية
            </Link>

            <Link href="/products" className="header-link">
              المنتجات
            </Link>

            <Link href="/offers" className="header-link">
              العروض
            </Link>

            <Link href="/blog" className="header-link">
              المدونة
            </Link>

            <Link href="/about" className="header-link">
              عن المتجر
            </Link>

            <Link href="/contact" className="header-link">
              اتصل بنا
            </Link>
          </nav>

          {/* أدوات المستخدم */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">

            {/* مبدل العملات */}
            <CurrencySelector />

            {/* البحث */}
            <Link
              href="/products"
              className="header-icon"
              aria-label="البحث"
              title="البحث عن منتج"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* المنتجات المفضلة مع موشن نبض لحظي بدون رقم */}
            <Link
              href="/wishlist"
              className="header-icon relative"
              aria-label="المفضلة"
              title="المنتجات المفضلة"
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-gray-700'
                } ${isWishlistPulsing ? 'scale-135 text-rose-600 fill-rose-600 animate-pulse' : ''}`}
              />
            </Link>

            {/* الحساب */}
            <Link
              href="/account"
              className="header-icon flex items-center gap-1.5"
              aria-label="الحساب"
              title={user ? `حسابي (${user.name || user.email})` : 'تسجيل الدخول / حسابي'}
            >
              <User className={`w-5 h-5 ${user ? 'text-primary-600' : ''}`} />
              {user && (
                <span className="text-xs font-bold text-gray-800 max-w-[70px] truncate hidden xl:inline">
                  {user.name?.split(' ')[0] || 'حسابي'}
                </span>
              )}
            </Link>

            {/* السلة مع موشن لحظي عند الإضافة */}
            <Link
              href="/cart"
              className="header-icon relative"
              aria-label="سلة التسوق"
              title="سلة التسوق"
            >
              <ShoppingCart
                className={`w-5 h-5 transition-all duration-300 ${
                  isCartPulsing ? 'scale-125 text-[var(--color-primary)] animate-bounce' : ''
                }`}
              />

              {totalCount > 0 && (
                <span className={`cart-count ${isCartPulsing ? 'animate-ping' : ''}`}>
                  {totalCount}
                </span>
              )}
            </Link>

            {/* زر القائمة للشاشات الصغيرة والجوال (الشرطات الثلاثة / الإغلاق) */}
            <button
              type="button"
              className="header-icon lg:hidden cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="القائمة"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* قائمة الجوال المنسدلة */}
        {isMenuOpen && (
          <div className="mobile-menu lg:hidden pb-4">
            <nav className="flex flex-col gap-1">

              <Link
                href="/"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>

              <Link
                href="/products"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                المنتجات
              </Link>

              <Link
                href="/offers"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                العروض
              </Link>

              <Link
                href="/blog"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                المدونة والمقالات
              </Link>

              <Link
                href="/about"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                عن المتجر
              </Link>

              <Link
                href="/contact"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                اتصل بنا
              </Link>

              <Link
                href="/wishlist"
                className="mobile-menu-link flex items-center justify-between"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>المفضلة ❤️</span>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                حسابي وطلباتي
              </Link>

            </nav>
          </div>
        )}

      </div>
    </header>
  );
}