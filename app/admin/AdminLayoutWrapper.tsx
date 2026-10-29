'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminNav from './components/AdminNav';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    isLoginPage ? true : null
  );

  useEffect(() => {
    if (isLoginPage) return;

    let isMounted = true;
    async function verifyAuth() {
      try {
        const res = await fetch('/api/admin/auth/verify');
        const data = await res.json();

        if (!isMounted) return;

        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (err) {
        if (!isMounted) return;
        setIsAuthenticated(false);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }

    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // صفحة تسجيل الدخول تعرض بدون إطار لوحة التحكم
  if (isLoginPage) {
    return <>{children}</>;
  }

  // شاشة فحص الصلاحيات اللحظية
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-primary-600 flex items-center justify-center shadow-xs border border-purple-100">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-primary-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-bold text-gray-600">
            جاري التحقق من أمان وصلاحيات لوحة التحكم...
          </span>
        </div>
      </div>
    );
  }

  // إذا لم يكن مصرحاً له، يظل فارغاً حتى يتم التحويل
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <AdminNav />
      <main className="animate-fade-in">{children}</main>
    </div>
  );
}

