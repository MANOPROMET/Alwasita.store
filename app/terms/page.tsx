// app/terms/page.tsx
import Link from 'next/link';
import { getStoreSettings } from '@/lib/appwrite/api';
import { FileText, CheckCircle2, ChevronLeft, AlertCircle, Scale, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TermsPage() {
  const settings = await getStoreSettings();

  const storeName = settings?.storeName || 'متجر الواسطة';

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
            <span className="text-gray-900 font-bold">الشروط والأحكام</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* رأس الصفحة مع شارة الأيقونة */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 text-[var(--color-primary)] shadow-sm">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            الشروط والأحكام العامة
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            تحكم هذه الاتفاقية استخدامك لخدمات وموقع {storeName} وتحدد حقوق والتزامات كل من المتجر والمشتري.
          </p>
        </div>

        {/* بنود الشروط والأحكام */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">
                1
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">أهلية الاستخدام والتسوق</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              باستخدامك لموقع {storeName}، فإنك تقر بأنك مؤهل قانونياً لإجراء المعاملات التجارية وتلتزم بتقديم معلومات دقيقة وصحيحة (كالاسم، ورقم الهاتف، وعنوان الشحن) لإتمام الطلبات بنجاح.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">
                2
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">الأسعار والعملات وتحويل الصرف</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              جميع الأسعار المعروضة في المتجر مسجلة بالعملة الأساسية (الريال السعودي SAR)، ويتم احتساب وتحويل الأسعار بالريال اليمني أو الدولار الأمريكي تلقائياً بناءً على أسعار الصرف اليومية المحدثة والمعتمدة من قبل إدارة المتجر.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">
                3
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">تأكيد الطلبات وإجراءات الدفع</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              يعد الطلب المرسل عبر السلة أو الواتساب بمثابة طلب حجز مبدئي (قيد الانتظار)، ولا يصبح الطلب سارياً ونهائياً إلا بعد مراجعة المخزون وتأكيده من قبل فريق خدمة العملاء واعتماد التحويل المالي أو آلية الدفع المتفق عليها.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">
                4
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">حالة المنتجات وضمانها</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              يلتزم {storeName} بتوضيح حالة المنتج بدقة (جديد بالكرتون، أو مستخدم أمريكي / محلي مفحوص). المنتجات الجديدة تخضع لضمان الوكالة، والمنتجات المستخدمة تخضع لفحص تشغيلي يضمن سلامتها وقت التسليم، مع سريان سياسة الإرجاع في حال وجود خلل فني خلال 24 ساعة.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">
                5
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">تعديل الشروط والأسعار</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              يحق لإدارة المتجر تحديث الأسعار أو العروض أو تعديل هذه الشروط في أي وقت لمواكبة التغيرات في السوق وتكاليف التوريد، وتكون الشروط المحدثة سارية من تاريخ نشرها على الموقع.
            </p>
          </div>

        </div>

        {/* تنويه ختامي */}
        <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 font-medium leading-relaxed">
          باستمرارك في تصفح المتجر أو إتمام أي عملية شراء، فإنك توافق على الالتزام بكافة الشروط والأحكام المذكورة أعلاه.
        </div>

      </div>
    </div>
  );
}
