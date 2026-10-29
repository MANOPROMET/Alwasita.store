'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite/client';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  // جلب عدد الطلبات المعلقة للإشعار
  useEffect(() => {
    async function loadPending() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success && data.stats) {
          setPendingCount(data.stats.pendingOrders || 0);
        }
      } catch (e) {
        // ignore
      }
    }
    loadPending();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    try {
      await account.deleteSession('current');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wasita_admin_session');
    }
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
    { href: '/admin/products', label: 'المنتجات', icon: Package },
    { href: '/admin/categories', label: 'الأقسام والتصنيفات', icon: Layers },
    {
      href: '/admin/orders',
      label: 'إدارة الطلبات',
      icon: ShoppingBag,
      badge: pendingCount && pendingCount > 0 ? pendingCount : null,
    },
    { href: '/admin/banners', label: 'البنرات الإعلانية', icon: ImageIcon },
    { href: '/admin/settings', label: 'إعدادات المتجر', icon: Settings },
  ];

  const isActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* الشعار وعنوان لوحة الإدارة */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center p-1.5 border border-purple-100 group-hover:scale-105 transition">
                <Image
                  src="/mylogo.png"
                  alt="متجر الواسطة"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-1.5">
                  متجر <span className="text-primary-600">الواسطة</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-primary-700 mr-1">
                    الإدارة
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* روابط التصفح للشاشات المتوسطة والكبيرة */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition relative ${
                    active
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-purple-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        active
                          ? 'bg-amber-400 text-gray-900'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* الإجراءات الجانبية: زيارة المتجر + الخروج */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200/80 text-gray-700 transition"
              title="معاينة المتجر كزائر"
            >
              <span>المتجر الحي</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>

            {/* زر القائمة للشاشات الصغيرة */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* قائمة الموبايل المنسدلة */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1.5 shadow-lg">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-primary-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-gray-900">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-gray-100 mt-2">
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              <span>معاينة المتجر الحي</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
