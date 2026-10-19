'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite/client';
import {
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  Plus,
  Loader2,
  Settings,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  TrendingUp,
  Store,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';

interface StatsData {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalBanners: number;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    account
      .get()
      .then(() => {
        setCheckingAuth(false);
      })
      .catch(() => {
        const isLocalAdmin =
          typeof window !== 'undefined' &&
          sessionStorage.getItem('wasita_admin_session') === 'active';
        if (isLocalAdmin) {
          setCheckingAuth(false);
        } else {
          router.push('/admin/login');
        }
      });
  }, [router]);

  // جلب إحصائيات المتجر الحية
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }

    if (!checkingAuth) {
      fetchStats();
    }
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-xs font-bold text-gray-500">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3" />
            قيد الانتظار
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <CheckCircle2 className="w-3 h-3" />
            مؤكد
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
            <Truck className="w-3 h-3" />
            جاري الشحن
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3" />
            تم التسليم
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
            <AlertCircle className="w-3 h-3" />
            ملغي
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ترويسة الترحيب والشريط السريع */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/70 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-primary-700 text-xs font-bold border border-purple-100 mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>متصل بقاعدة البيانات السحابية (Appwrite)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            مرحباً بك في لوحة تحكم الإدارة
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            من هنا يمكنك إدارة منتجات متجر الواسطة، طلبات العملاء، الفئات، والبنرات الترويجية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>عرض الطلبات</span>
          </Link>
        </div>
      </div>

      {/* بطاقات الإحصائيات الحية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* إجمالي المنتجات */}
        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-3xl border border-gray-200/70 hover:border-primary-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">إجمالي المنتجات</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {loadingStats ? '...' : stats?.totalProducts ?? 0}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              ({stats?.activeProducts ?? 0} نشط)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-primary-600 group-hover:translate-x-[-2px] transition">
            <span>إدارة المنتجات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* إجمالي الطلبات */}
        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-3xl border border-gray-200/70 hover:border-amber-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">طلبات العملاء</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {loadingStats ? '...' : stats?.totalOrders ?? 0}
            </span>
            {(stats?.pendingOrders ?? 0) > 0 && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                {stats?.pendingOrders} بانتظار التأكيد
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-600 group-hover:translate-x-[-2px] transition">
            <span>متابعة الطلبات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* الأقسام والتصنيفات */}
        <Link
          href="/admin/categories"
          className="bg-white p-6 rounded-3xl border border-gray-200/70 hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">الأقسام والتصنيفات</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {loadingStats ? '...' : stats?.totalCategories ?? 0}
            </span>
            <span className="text-xs font-bold text-gray-400">أقسام مفعلة</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:translate-x-[-2px] transition">
            <span>إدارة الفئات وإضافة أقسام</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* البنرات الترويجية */}
        <Link
          href="/admin/banners"
          className="bg-white p-6 rounded-3xl border border-gray-200/70 hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">البنرات الإعلانية</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {loadingStats ? '...' : stats?.totalBanners ?? 0}
            </span>
            <span className="text-xs font-bold text-gray-400">عروض نشطة</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:translate-x-[-2px] transition">
            <span>إدارة البنرات والعروض</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </Link>

      </div>

      {/* قسم أحدث الطلبات المستلمة */}
      <div className="bg-white rounded-3xl border border-gray-200/70 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-primary-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">أحدث طلبات الشراء</h2>
              <p className="text-xs text-gray-500">الطلبات المسجلة من سلة المشتريات وموقع المتجر</p>
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline"
          >
            <span>عرض كل الطلبات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingStats ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-black text-gray-500">
                  <th className="py-3.5 px-4 rounded-r-xl">العميل</th>
                  <th className="py-3.5 px-4">رقم الهاتف</th>
                  <th className="py-3.5 px-4">إجمالي المبلغ</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center rounded-l-xl">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.$id} className="hover:bg-purple-50/20 transition">
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-600">
                      {order.customerPhone}
                    </td>
                    <td className="py-4 px-4 font-black text-gray-900">
                      {order.currency === 'USD' ? (
                        <span>${Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      ) : (
                        <span>
                          {Number(order.totalAmount).toLocaleString('ar-SA')}{' '}
                          <span className="text-xs font-normal text-gray-500">
                            {order.currency === 'YER' || order.currency === 'ر.ي' ? 'ر.ي' : 'ر.س'}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        href={`/admin/orders?highlight=${order.$id}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-purple-50 hover:text-primary-600 text-xs font-bold transition inline-block"
                      >
                        معاينة
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-sm">
            لا توجد طلبات مسجلة حتى الآن.
          </div>
        )}
      </div>

      {/* شبكة الأقسام السريعة */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-gray-900">أقسام لوحة التحكم</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* إدارة المنتجات */}
          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-3xl border border-gray-200/80 hover:border-primary-500 hover:shadow-md transition space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition">
                إدارة المنتجات
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                إضافة أجهزة وهواتف جديدة، تعديل الأسعار، تغيير الصور والنسخ، أو إيقاف العرض.
              </p>
            </div>
          </Link>

          {/* إدارة الأقسام والتصنيفات */}
          <Link
            href="/admin/categories"
            className="bg-white p-6 rounded-3xl border border-gray-200/80 hover:border-primary-500 hover:shadow-md transition space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition">
                الأقسام والتصنيفات
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                إضافة فئات جديدة (لوحيات، شبكات، ملحقات)، ترتيب ظهورها وتغيير مسمياتها.
              </p>
            </div>
          </Link>

          {/* إدارة الطلبات */}
          <Link
            href="/admin/orders"
            className="bg-white p-6 rounded-3xl border border-gray-200/80 hover:border-primary-500 hover:shadow-md transition space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition">
                إدارة طلبات الشراء
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                متابعة طلبات العملاء، تحديث حالة التوصيل، والتواصل السريع عبر واتساب.
              </p>
            </div>
          </Link>

          {/* إدارة البنرات */}
          <Link
            href="/admin/banners"
            className="bg-white p-6 rounded-3xl border border-gray-200/80 hover:border-primary-500 hover:shadow-md transition space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition">
                البنرات والعروض الترويجية
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                تحديث صور البنرات في الواجهة الرئيسية، روابط التخفيضات والعروض الموسمية.
              </p>
            </div>
          </Link>

          {/* إعدادات المتجر */}
          <Link
            href="/admin/settings"
            className="bg-white p-6 rounded-3xl border border-gray-200/80 hover:border-primary-500 hover:shadow-md transition space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition">
                إعدادات المتجر
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                تعديل اسم المتجر، رقم الواتساب المعتمد لتلقي الطلبات، ورقم خدمة العملاء.
              </p>
            </div>
          </Link>

          {/* المدونة والمقالات */}
          <Link
            href="/admin/blog"
            className="bg-white p-6 rounded-3xl border border-gray-200/80 hover:border-primary-500 hover:shadow-md transition space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition">
                إدارة المدونة والمقالات
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                إضافة ونشر المقالات التقنية، إرشادات فحص الأجهزة، وتثقيف عملاء المتجر.
              </p>
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}