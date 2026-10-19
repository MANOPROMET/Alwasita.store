// app/returns/page.tsx
import Link from 'next/link';
import { getStoreSettings } from '@/lib/appwrite/api';
import { RotateCcw, AlertTriangle, Clock, CheckCircle2, ChevronLeft, MessageCircle, ShieldX, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReturnsPage() {
  const settings = await getStoreSettings();

  const storeName = settings?.storeName || 'متجر الواسطة';
  const whatsappNumber = settings?.whatsappNumber || '967771211394';
  const dynamicReturnPolicyInfo = settings?.returnPolicyInfo;

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
            <span className="text-gray-900 font-bold">سياسة الإرجاع والاستبدال</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* رأس الصفحة مع شارة الأيقونة */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            سياسة الإرجاع والاستبدال
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            تضمن لك هذه السياسة الشفافية الكاملة وحقك في استلام أجهزة ومعدات سليمة مطابقة للمواصفات المعلنة.
          </p>
        </div>

        {/* النص المخصص من إعدادات المتجر إن وجد */}
        {dynamicReturnPolicyInfo && (
          <div className="p-5 sm:p-6 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium leading-relaxed flex items-start gap-3.5 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">الشرط الأساسي المعتمد من الإدارة:</span>
              <p>{dynamicReturnPolicyInfo}</p>
            </div>
          </div>
        )}

        {/* الشروط المحورية للإرجاع */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">1. الحالات المقبولة للإرجاع</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              يقبل الإرجاع أو الاستبدال <strong>حصراً في حالة وجود خلل فني أو مصنعي مثبت</strong> في الجهاز أو المنتج، ولا يشمل التراجع عن الشراء أو تغيير الرأي بعد استلام الجهاز سليماً.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-primary-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">2. المهلة المحددة للإشعار (24 ساعة)</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              يجب إشعار المتجر وتقديم بلاغ الخلل الفني خلال <strong>مدة أقصاها يوم واحد فقط (24 ساعة)</strong> من وقت وتاريخ استلام الطلب من شركة النقل أو المندوب.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">3. شروط سلامة الكرتون والملحقات</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              يشترط أن يكون المنتج بكامل ملحقاته الأصلية وأغلفة الحماية والكرتون دون أي تلف أو تمزيق، وخالياً من أي أثر للخدوش أو السقوط.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <ShieldX className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">4. استثناءات لا يشملها الإرجاع</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              الأعطال الناتجة عن سوء الاستخدام، السقوط، تعرض الأجهزة للرطوبة أو السوائل، تذبذب التيار الكهربائي، أو محاولات الصيانة الخارجية تلغي حق الإرجاع تماماً.
            </p>
          </div>

        </div>

        {/* خطوات تقديم طلب إرجاع */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-gray-900">خطوات تقديم طلب فحص أو إرجاع</h2>
          <ol className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed list-decimal list-inside">
            <li>قم بتصوير فيديو واضح يوثق الخلل الفني في الجهاز ورقم السيريال (Serial Number).</li>
            <li>تواصل مباشرة مع خدمة العملاء عبر الواتساب مع تزويدنا برقم الطلب وسند الشحن.</li>
            <li>يقوم الفريق الفني بمراجعة البلاغ وتوجيهك بطريقة تسليم الجهاز للفحص والاعتماد الفوري.</li>
            <li>في حال ثبوت الخلل الفني يتم استبدال المنتج بمنتج جديد أو إرجاع المبلغ المدفوع حسب رغبة العميل.</li>
          </ol>
        </div>

        {/* المساعدة والتواصل بشأن الإرجاع */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-zinc-900 text-white rounded-3xl space-y-4 shadow-lg text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">هل واجهت أي مشكلة فنية في طلبك؟</h3>
            <p className="text-xs text-zinc-300">
              تواصل مع الدعم الفني فوراً وسنكون بجانبك لحل المشكلة واستبدال الجهاز بأسرع وقت.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، وصلني الطلب وفيه مشكلة فنية أود الإبلاغ عنها خلال مهلة الـ 24 ساعة.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shrink-0 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>إشعار المتجر عبر الواتساب</span>
          </a>
        </div>

      </div>
    </div>
  );
}
