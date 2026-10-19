'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  MessageCircle,
  ChevronLeft,
  Truck,
  Heart,
  LogOut,
  Loader2,
  ArrowRight,
  HelpCircle,
  X,
  Mail,
  Lock,
  UserCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  id: string;
  shortId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

// أيقونة Google الرسمية بألوانها الأصلية
function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AccountContent() {
  const searchParams = useSearchParams();
  const urlAuthError = searchParams?.get('error');

  const {
    user,
    loading: authLoading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    authError,
    setAuthError,
  } = useAuth();
  const { totalCount: cartCount } = useCart();
  const { wishlist, wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist' | 'support'>('orders');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);

  // تسجيل الدخول بالبريد الإلكتروني
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isSubmittingEmailAuth, setIsSubmittingEmailAuth] = useState(false);

  // بيانات المستخدم للشحن
  const [savedName, setSavedName] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [savedCity, setSavedCity] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // تتبع الطلبات
  const [searchPhone, setSearchPhone] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // استرجاع البيانات المحفوظة من localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem('wasita_customer_info');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.name) setSavedName(parsed.name);
        if (parsed.phone) {
          setSavedPhone(parsed.phone);
          setSearchPhone(parsed.phone);
          fetchOrders(parsed.phone);
        }
        if (parsed.city) setSavedCity(parsed.city);
        if (parsed.address) setSavedAddress(parsed.address);
      }
    } catch (e) {
      console.error('Failed to load profile from storage', e);
    }
  }, []);

  // تحديث الاسم عند تسجيل الدخول
  useEffect(() => {
    if (user?.name && !savedName) {
      setSavedName(user.name);
    }
  }, [user, savedName]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setIsLoggingIn(false);
      setShowGoogleHelp(true);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) return;

    try {
      setIsSubmittingEmailAuth(true);
      if (authMode === 'login') {
        await loginWithEmail(authEmail, authPassword);
      } else {
        await registerWithEmail(authEmail, authPassword, authName || authEmail.split('@')[0]);
      }
    } catch (err) {
      console.error('Auth submit error:', err);
    } finally {
      setIsSubmittingEmailAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const info = {
        name: savedName.trim(),
        phone: savedPhone.trim(),
        city: savedCity.trim(),
        address: savedAddress.trim(),
      };
      localStorage.setItem('wasita_customer_info', JSON.stringify(info));
      setIsSavedFeedback(true);
      setTimeout(() => setIsSavedFeedback(false), 3000);
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  };

  const fetchOrders = async (phoneToSearch: string) => {
    if (!phoneToSearch || phoneToSearch.trim().length < 6) {
      setSearchError('يرجى إدخال رقم هاتف صحيح للبحث (6 أرقام على الأقل)');
      return;
    }

    setSearchError('');
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(phoneToSearch.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
        setSearchError(data.error || 'لم يتم العثور على أي طلبات بهذا الرقم');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setSearchError('حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchPhone);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            مكتمل
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            جاري الشحن
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            تم التأكيد
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            ملغي
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            قيد الانتظار
          </span>
        );
    }
  };

  const userInitial = user?.name ? user.name.trim().charAt(0) : 'ع';

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      
      {/* 1. مسار التصفح (Breadcrumb) */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">حسابي وطلباتي</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* نافذة توضيحية لتفعيل Google OAuth في Appwrite */}
        {showGoogleHelp && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 relative animate-fadeIn space-y-3">
            <button
              type="button"
              onClick={() => setShowGoogleHelp(false)}
              className="absolute top-4 left-4 p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>ملاحظة تفعيل تسجيل الدخول عبر Google في Appwrite (Error 412)</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              لتفعيل زر Google بنجاح، يُرجى الدخول إلى لوحة تحكم Appwrite الخاصة بمشروعك وتفعيل المزود بالخطوات التالية:
            </p>
            <ol className="text-xs text-amber-900 list-decimal list-inside space-y-1 font-medium pr-2">
              <li>ادخل إلى لوحة Appwrite Console وتوجه إلى قسم <strong>Auth</strong>.</li>
              <li>اختر تبويب <strong>Settings</strong> ثم انزل إلى قسم <strong>OAuth2 Providers</strong>.</li>
              <li>اختر <strong>Google</strong> واضغط على تفعيل (Enable).</li>
              <li>ضع الـ <strong>Client ID</strong> والـ <strong>Client Secret</strong> من Google Cloud Console واحفظ التغييرات.</li>
            </ol>
            <p className="text-xs text-amber-800 pt-1">
              💡 <strong>حل فوري:</strong> يمكنك الآن استخدام البريد الإلكتروني وكلمة المرور في النموذج أدناه، أو تتبع طلباتك برقم الهاتف مباشرة.
            </p>
          </div>
        )}

        {/* تنبيه الخطأ العام للمصادقة */}
        {(authError || urlAuthError === 'auth_failed') && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 font-bold flex items-center justify-between">
            <span>{authError || 'تعذر إتمام المصادقة عبر Google. يرجى تفعيل المزود في Appwrite أو استخدام البريد.'}</span>
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setShowGoogleHelp(true);
              }}
              className="text-xs text-rose-700 underline cursor-pointer mr-2 shrink-0 font-bold"
            >
              شرح التفعيل
            </button>
          </div>
        )}

        {/* 2. بطاقة الحساب أو تسجيل الدخول */}
        {authLoading ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
            <span className="mr-3 text-sm text-gray-500 font-medium">جاري التحقق من الحساب...</span>
          </div>
        ) : user ? (
          // المستخدم مسجل دخوله
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
                {userInitial}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {user.name || 'عميل متجر الواسطة'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    حساب نشط وموثق
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Link
                href="/wishlist"
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-bold border border-gray-200 transition flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>المفضلة ({wishlistCount})</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        ) : (
          // المستخدم غير مسجل - خيارات الدخول (Google + البريد الإلكتروني) بطريقة هادئة وراقية
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  تسجيل الدخول إلى حسابك
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  سجّل دخولك بالبريد أو Google لحفظ أجهزتك المفضلة، متابعة فواتيرك، وتعبئة بيانات الشحن تلقائياً.
                </p>
              </div>

              {/* خيار Google */}
              <div className="shrink-0 flex flex-col sm:items-end gap-1.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm rounded-2xl border border-gray-300 shadow-xs hover:border-gray-400 transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[var(--color-primary)] animate-spin" />
                      <span>جاري التوجيه إلى Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>تسجيل الدخول عبر Google</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoogleHelp((prev) => !prev)}
                  className="text-[11px] text-gray-400 hover:text-[var(--color-primary)] font-medium flex items-center gap-1 self-center sm:self-end"
                >
                  <HelpCircle className="w-3 h-3 text-amber-500" />
                  <span>كيفية تفعيل Google في Appwrite؟</span>
                </button>
              </div>
            </div>

            {/* تسجيل الدخول / إنشاء حساب بالبريد الإلكتروني */}
            <div className="max-w-md mx-auto space-y-4 pt-2">
              <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    authMode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  تسجيل الدخول بالبريد
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    authMode === 'register' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  إنشاء حساب جديد
                </button>
              </div>

              <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">الاسم الكامل</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="مثال: أحمد سالم"
                        className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="8 خانات على الأقل"
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEmailAuth}
                  className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  {isSubmittingEmailAuth ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authMode === 'login' ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmittingEmailAuth
                      ? 'جاري التنفيذ...'
                      : authMode === 'login'
                      ? 'تسجيل الدخول'
                      : 'إنشاء الحساب ومتابعة التسوق'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. شريط التبويبات المتناسق والمبسط */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>متابعة وتتبع طلباتي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>بيانات الشحن</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>المنتجات المفضلة ({wishlistCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'support'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>خدمة العملاء والدعم</span>
          </button>
        </div>

        {/* 4. محتوى التبويبات */}

        {/* أ) تبويب تتبع الطلبات */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7">
              <div className="max-w-xl space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    تتبع طلباتك برقم هاتفك
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    أدخل رقم الهاتف المسجل عند الطلب لمتابعة حالة شحن وتجهيز طلباتك
                  </p>
                </div>

                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      placeholder="أدخل رقم هاتفك (مثال: 771234567)"
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isSearching ? 'جاري البحث...' : 'عرض طلباتي'}</span>
                  </button>
                </form>

                {searchError && (
                  <p className="text-xs text-rose-600 font-medium pt-1">
                    {searchError}
                  </p>
                )}
              </div>
            </div>

            {/* قائمة الطلبات المطابقة */}
            {orders.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-bold text-gray-900">
                    الطلبات المسجلة ({orders.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((order) => {
                    const orderDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('ar-YE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'تاريخ غير محدد';

                    const whatsappInquiryUrl = `https://wa.me/967771211394?text=${encodeURIComponent(
                      `مرحباً متجر الواسطة، أود الاستفسار عن حالة طلبي رقم #${order.shortId}`
                    )}`;

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4 hover:border-[var(--color-primary-soft)] transition"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-xs text-gray-400 font-medium">رقم الطلب</span>
                            <div className="text-sm sm:text-base font-black text-gray-900 tracking-wide">
                              #{order.shortId}
                            </div>
                          </div>
                          <div>{getStatusBadge(order.status)}</div>
                        </div>

                        {/* مراحل الطلب */}
                        {order.status !== 'cancelled' ? (
                          <div className="pt-2 pb-2 px-3 bg-purple-50/40 rounded-2xl border border-purple-100/60">
                            <div className="relative flex items-center justify-between">
                              <div className="absolute top-3 left-4 right-4 h-1 bg-gray-200 z-0" />
                              <div
                                className="absolute top-3 right-4 h-1 bg-[var(--color-primary)] transition-all duration-500 z-0"
                                style={{
                                  width:
                                    order.status === 'delivered' || order.status === 'completed'
                                      ? 'calc(100% - 2rem)'
                                      : order.status === 'shipped'
                                      ? 'calc(66% - 1rem)'
                                      : order.status === 'confirmed'
                                      ? 'calc(33% - 0.5rem)'
                                      : '0%',
                                }}
                              />

                              {[
                                { id: 'pending', label: 'قيد الانتظار' },
                                { id: 'confirmed', label: 'تم التأكيد' },
                                { id: 'shipped', label: 'جاري الشحن' },
                                { id: 'delivered', label: 'مكتمل' },
                              ].map((step, idx) => {
                                const stepOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
                                const currentStepIdx =
                                  order.status === 'completed'
                                    ? 3
                                    : stepOrder.indexOf(order.status) >= 0
                                    ? stepOrder.indexOf(order.status)
                                    : 0;
                                const isDone = currentStepIdx >= idx;
                                const isCurrent = currentStepIdx === idx;

                                return (
                                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-1">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                        isCurrent
                                          ? 'bg-[var(--color-primary)] text-white ring-4 ring-purple-200 scale-110'
                                          : isDone
                                          ? 'bg-[var(--color-primary)] text-white'
                                          : 'bg-white border-2 border-gray-300 text-gray-400'
                                      }`}
                                    >
                                      {isDone ? '✓' : idx + 1}
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold ${
                                        isCurrent
                                          ? 'text-[var(--color-primary)] font-black'
                                          : isDone
                                          ? 'text-gray-900'
                                          : 'text-gray-400'
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold text-center">
                            تم إلغاء هذا الطلب
                          </div>
                        )}

                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span className="text-gray-400">تاريخ الطلب:</span>
                            <span className="font-semibold text-gray-800">{orderDate}</span>
                          </div>

                          {order.customerAddress && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">عنوان التوصيل:</span>
                              <span className="font-semibold text-gray-800 max-w-[200px] truncate">
                                {order.customerAddress}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                            <span className="font-bold text-gray-900">إجمالي الفاتورة:</span>
                            <span className="text-base font-black text-[var(--color-primary)]">
                              {order.currency === 'USD'
                                ? `$${Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : `${Number(order.totalAmount).toLocaleString('ar-SA')} ${
                                    order.currency === 'YER' || order.currency === 'ر.ي'
                                      ? 'ر.ي'
                                      : order.currency === 'USD' || order.currency === '$'
                                      ? '$'
                                      : 'ر.س'
                                  }`}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <a
                            href={whatsappInquiryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition text-xs border border-gray-200 hover:border-emerald-200"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>متابعة الطلب عبر واتساب</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : hasSearched && !isSearching ? (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-10 text-center space-y-3">
                <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto border border-gray-100">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-gray-900">لا توجد طلبات مسجلة بهذا الرقم</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  تأكد من إدخال نفس رقم الهاتف الذي قمت باستخدامه عند الشراء في سلة المتجر.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* ب) تبويب بيانات الشحن */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                بيانات التوصيل السريع
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                احفظ بياناتك هنا ليتم تعبئتها تلقائياً عند الشراء لتسهيل طلباتك القادمة
              </p>
            </div>

            {isSavedFeedback && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم حفظ بيانات الشحن بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value)}
                  placeholder="مثال: محمد عبدالله باوزير"
                  className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  رقم الهاتف / الواتساب
                </label>
                <input
                  type="tel"
                  required
                  value={savedPhone}
                  onChange={(e) => setSavedPhone(e.target.value)}
                  placeholder="مثال: 771234567"
                  className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    المدينة / المحافظة
                  </label>
                  <input
                    type="text"
                    value={savedCity}
                    onChange={(e) => setSavedCity(e.target.value)}
                    placeholder="مثال: سيئون"
                    className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={savedAddress}
                    onChange={(e) => setSavedAddress(e.target.value)}
                    placeholder="الشارع أو المعلم القريب"
                    className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ بيانات الشحن</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ج) تبويب المفضلة السريع */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  قائمة المنتجات المفضلة
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  المنتجات التي قمت بالإعجاب بها لحفظها والرجوع إليها لاحقاً
                </p>
              </div>

              <Link
                href="/wishlist"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-xl transition shrink-0"
              >
                <span>عرض صفحة المفضلة بالكامل</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            {wishlistCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.slice(0, 4).map((product) => (
                  <Link
                    key={product.$id}
                    href={`/products/${product.$id}`}
                    className="p-3 border border-gray-200 rounded-2xl hover:border-[var(--color-primary)] transition flex items-center gap-3 group"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-400">📱</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-[var(--color-primary)]">
                        {product.name}
                      </h4>
                      <p className="text-xs font-black text-[var(--color-primary)] mt-1">
                        {product.price ? `${Number(product.price).toLocaleString('ar-SA')} ر.س` : 'السعر عند الطلب'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Heart className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-gray-800">قائمة المفضلة فارغة حالياً</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  تصفح المنتجات وانقر على رمز القلب لحفظ الأجهزة التي تعجبك هنا
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
                >
                  استكشاف المنتجات
                </Link>
              </div>
            )}
          </div>
        )}

        {/* د) تبويب خدمة العملاء والدعم */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">خدمة العملاء المباشرة</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                فريق متجر الواسطة جاهز للرد على كافة استفساراتك واستقبال طلباتك يومياً عبر الواتساب.
              </p>
              <a
                href="https://wa.me/967771211394"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة واتساب مباشرة: 771211394</span>
              </a>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">الشحن والتوصيل</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                تغليف آمن وشحن مباشر لكافة المحافظات والمدن اليمنية عبر مكاتب النقل المعتمدة.
              </p>
              <Link
                href="/shipping"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline pt-2"
              >
                <span>تفاصيل مدة ورسوم الشحن</span>
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">سياسة الضمان والاسترجاع</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                كافة أجهزتنا أصلية ومضمونة، مع إمكانية الفحص والتأكد وضمان استبدال فوري عند وجود أي عيب مصنعي.
              </p>
              <Link
                href="/returns"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline pt-2"
              >
                <span>سياسة الاستبدال والاسترجاع</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/70 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
