'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // التحقق أولاً إذا كان المدير مسجل دخول مسبقاً
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth/verify');
        const data = await res.json();
        if (isMounted && data.authenticated) {
          router.replace(redirectPath);
          return;
        }
      } catch {
        // ليس مسجلاً
      } finally {
        if (isMounted) setCheckingExisting(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'بيانات الدخول غير صحيحة، أو ليس لديك صلاحية مدير.');
        setLoading(false);
        return;
      }

      // نجاح تسجيل الدخول - التوجيه إلى لوحة التحكم
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="text-xs font-bold text-gray-400">جاري التحقق من الجلسة...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رسالة الخطأ */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold flex items-center gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* نموذج تسجيل الدخول المحمي */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block">
            البريد الإلكتروني المعتمد للمدير:
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@alwasita.net"
              autoComplete="username"
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block">
            كلمة مرور الإدارة:
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري التحقق والمصادقة...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>تسجيل الدخول الآمن</span>
              <ArrowRight className="w-4 h-4 mr-1" />
            </>
          )}
        </button>
      </form>

      {/* تنبيه أمان */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 leading-relaxed text-center font-medium">
        🔒 هذه المنطقة محمية ومشفرة. الوصول مخصص فقط لمدير متجر الواسطة المعتمد.
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-md space-y-7">
        {/* الترويسة والشعار */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-primary-600 flex items-center justify-center mx-auto p-2.5 border border-purple-100 shadow-xs">
            <Image
              src="/mylogo.png"
              alt="متجر الواسطة"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            لوحة تحكم إدارة المتجر
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            سجل الدخول بحساب المشرف المصرح له لإدارة المتجر
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* رابط العودة للمتجر */}
        <div className="text-center pt-2 border-t border-gray-100">
          <Link
            href="/"
            className="text-xs font-bold text-gray-500 hover:text-primary-600 transition"
          >
            العودة لصفحة المتجر الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}