// app/privacy/page.tsx
import Link from 'next/link';
import { getStoreSettings } from '@/lib/appwrite/api';
import { ChevronLeft, Mail, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PrivacyPage() {
  const settings = await getStoreSettings();

  const storeName = settings?.storeName || 'متجر الواسطة';
  const rawEmail = settings?.storeEmail || 'alwasita.stor@gmail.com';
  const storeEmail = rawEmail.replace('alwasita.stor@gamil.com', 'alwasita.stor@gmail.com');
  const storePhone = settings?.storePhone || settings?.whatsappNumber || '+967 771 211 394';

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
            <span className="text-gray-900 font-bold">سياسة الخصوصية</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* رأس الصفحة بدون أيقونات وبلون الهوية البصرية */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--color-primary)] tracking-tight">
            سياسة الخصوصية وحماية البيانات
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            نلتزم في {storeName} بحماية خصوصية عملائنا وأمان بياناتهم الشخصية والمالية بأعلى معايير الأمان.
          </p>
        </div>

        {/* أقسام سياسة الخصوصية */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[var(--color-primary)]">1. البيانات التي نجمعها</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              عند استخدامك لـ {storeName} أو تقديم طلب شراء، نجمع فقط المعلومات الضرورية لمعالجة طلبك وإيصاله، وتشمل: الاسم، رقم الهاتف/الواتساب، العنوان أو المدينة للتوصيل، وأي ملاحظات خاصة بالطلب.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[var(--color-primary)]">2. كيفية استخدام بياناتك</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              تُستخدم بياناتك حصراً للأغراض التالية: تأكيد طلبات الشراء، تزويدك بسندات الشحن وفواتير الدفع، إرسال تحديثات حالة الشحنة عبر الواتساب أو الرسائل، وتقديم الدعم الفني وخدمات ما بعد البيع.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[var(--color-primary)]">3. عدم مشاركة البيانات مع أي طرف ثالث</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              نحن لا نبيع أو نؤجر أو نشارك معلومات عملائنا الشخصية مع أي شركات تسويق خارجية. تُشارك البيانات الأساسية (مثل الاسم ورقم الهاتف والعنوان) فقط مع شركات الشحن والتوصيل المعتمدة لإتمام تسليم شحنتك.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
            <h2 className="text-base sm:text-lg font-black text-[var(--color-primary)]">4. أمن البيانات وحمايتها</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              تُخزن بياناتك على خوادم آمنة ومشفرة، وتخضع لبروتوكولات حماية تمنع الوصول غير المصرح به أو التعديل أو التسريب.
            </p>
          </div>

          {/* 5. سياسة خصوصية تطبيق الواسطة المحاسبي وخدمات Google Drive */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <h2 className="text-base sm:text-lg font-black text-[var(--color-primary)]">
              5. سياسة خصوصية تطبيق &quot;الواسطة المحاسبي&quot; (Alwasita.Accounting) وخدمات Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              عند استخدامك لتطبيق الواسطة المحاسبي (Alwasita.Accounting) واختيارك تفعيل ميزة النسخ الاحتياطي السحابي عبر حسابك في Google:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed list-disc list-inside pr-1">
              <li>
                <strong className="font-bold text-gray-800">الصلاحيات المطلوبة:</strong> يطلب التطبيق صلاحية الوصول المحدود (drive.file) لإنشاء مجلد وملفات النسخ الاحتياطية الخاصة بالتطبيق فقط على مساحة Google Drive الشخصية للمستخدم، ولا يطلع التطبيق أو يصل إلى أي ملفات أو مستندات أخرى في حسابك.
              </li>
              <li>
                <strong className="font-bold text-gray-800">استخدام البيانات وتخزينها:</strong> تُستخدم بيانات الدخول إلى Google حصراً لرفع واستعادة قواعد البيانات المحاسبية الخاصة بك وتأمينها من الضياع. لا يتم تخزين بياناتك المحاسبية أو نسخك الاحتياطية على أي خوادم خارجية تابعة لنا؛ بل تبقى مشفرة ومملوكة بالكامل لك داخل حسابك في Google Drive.
              </li>
              <li>
                <strong className="font-bold text-gray-800">الالتزام بسياسة Google:</strong> يلتزم التطبيق التزاماً تاماً بسياسة بيانات مستخدمي خدمات واجهة برمجة تطبيقات Google (Google API Services User Data Policy)، بما في ذلك متطلبات الاستخدام المحدود (Limited Use).
              </li>
            </ul>
          </div>

        </div>

        {/* معلومات التواصل للاستفسار عن الخصوصية */}
        <div className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900">للاستفسارات المتعلقة بالخصوصية وحذف البيانات:</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            يمكنك التواصل مع إدارة {storeName} مباشرة لتعديل أو حذف بياناتك المسجلة عبر:
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-700 pt-1">
            {storeEmail && (
              <a
                href={`mailto:${storeEmail}`}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 transition text-gray-800"
              >
                <Mail className="w-4 h-4 text-primary-600" />
                <span>{storeEmail}</span>
              </a>
            )}
            {storePhone && (
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span dir="ltr">{storePhone}</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
