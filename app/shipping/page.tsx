// app/shipping/page.tsx
import Link from 'next/link';
import { getStoreSettings } from '@/lib/appwrite/api';
import { Truck, ShieldCheck, Clock, CheckCircle2, ChevronLeft, Phone, MessageCircle, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShippingPage() {
  const settings = await getStoreSettings();

  const storeName = settings?.storeName || 'متجر الواسطة';
  const whatsappNumber = settings?.whatsappNumber || '967771211394';
  const dynamicShippingInfo = settings?.shippingInfo;

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
            <span className="text-gray-900 font-bold">الشحن والتوصيل</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* رأس الصفحة مع شارة الأيقونة */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 text-[var(--color-primary)] shadow-sm">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            سياسة الشحن والتوصيل
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            نحرص في {storeName} على توفير تجربة تسوق مريحة مع شحن آمن وسريع يضمن وصول أجهزتك بحالة المصنع.
          </p>
        </div>

        {/* النص المخصص من إعدادات المتجر إن وجد */}
        {dynamicShippingInfo && (
          <div className="p-5 sm:p-6 bg-purple-50/80 rounded-2xl border border-purple-200/80 text-xs sm:text-sm text-purple-950 font-medium leading-relaxed flex items-start gap-3.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">تنبيه وملاحظة من إدارة المتجر:</span>
              <p>{dynamicShippingInfo}</p>
            </div>
          </div>
        )}

        {/* بنود وبطاقات سياسة الشحن */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">شحن آمن وتغليف محكم</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              يتم تغليف الأجهزة والهواتف والملحقات بعناية فائقة باستخدام مواد ماصة للصدمات لضمان حمايتها التامة أثناء النقل حتى استلامها بيدك.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">سرعة المعالجة والشحن</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              تتم معالجة وتجهيز الطلب خلال 24 ساعة من تأكيده. تستغرق مدة التوصيل من 1 إلى 3 أيام عمل حسب المدينة وموقع الاستلام.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3 md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">تكلفة الشحن وتفاصيل الدفع</h2>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <p>
                • <strong>كلفة الشحن الأساسية:</strong> يتم الاتفاق عليها مسبقاً وغالباً ما تكون كلفة الشحن والتوصيل على العميل بحسب المحافظة أو شركة النقل المختارة.
              </p>
              <p>
                • <strong>عروض الشحن الشامل:</strong> في حالات خاصة وعروض محددة (مثل العروض الترويجية أو الطلبات التي تتجاوز حداً معيناً)، تكون تكلفة الشحن مجانية ومشروطة وشاملة مع سعر المنتج كما هو موضح في صفحة العرض.
              </p>
              <p>
                • يتم تزويدك بسند الشحن ورقم التتبع فور تسليم الشحنة لشركة النقل المعتمدة لتتمكن من متابعتها بسهولة.
              </p>
            </div>
          </div>

        </div>

        {/* المساعدة والتواصل بشأن الشحن */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-zinc-900 text-white rounded-3xl space-y-4 shadow-lg text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">هل لديك استفسار عن موقعك وتكلفة الشحن؟</h3>
            <p className="text-xs text-zinc-300">
              تواصل مع فريق خدمة العملاء عبر الواتساب وسنزودك بتفاصيل ومسار الشحن المتاح لمنطقتك فوراً.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب بالاستفسار عن الشحن والتوصيل إلى مدينتي.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shrink-0 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>استفسر عبر الواتساب</span>
          </a>
        </div>

      </div>
    </div>
  );
}
