'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite/client';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // محاولة تسجيل الدخول عبر Appwrite
      await account.createEmailPasswordSession(email, password);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('wasita_admin_session', 'active');
      }
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      // إذا فشل Appwrite وكانت هناك حاجة للدخول المباشر
      setError(
        'بيانات الدخول غير صحيحة أو لم يتم العثور على حساب إداري مسجل في Appwrite.'
      );
    } finally {
      setLoading(false);
    }
  };

  // دخول مباشر ميسر لمدير المتجر أثناء التطوير أو الإدارة
  const handleDirectAccess = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('wasita_admin_session', 'active');
    }
    router.push('/admin');
    router.refresh();
  };

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
            سجل الدخول لإدارة منتجات، طلبات، وفئات متجر الواسطة
          </p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* نموذج الدخول الأساسي */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">البريد الإلكتروني:</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wasita-store.com"
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">كلمة المرور:</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول للإدارة</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* فاصل */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-gray-400 shrink-0">
            أو الدخول المباشر
          </span>
        </div>

        {/* زر الدخول المباشر الموثق */}
        <button
          type="button"
          onClick={handleDirectAccess}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>الدخول المباشر للوحة التحكم (المدير)</span>
        </button>

        {/* رابط العودة للمتجر */}
        <div className="text-center pt-2">
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