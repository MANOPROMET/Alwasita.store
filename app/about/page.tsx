// app/about/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPageBySlug } from '@/lib/appwrite/api';
import { ShieldCheck, Truck, Headphones, BadgePercent, ChevronLeft, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  const pageData = await getPageBySlug('about');

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
            <span className="text-gray-900 font-bold">عن المتجر</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
        
        {/* 2. البنر الرئيسي بصورة abutP.jpeg وأوفرلاي خفيف */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 shadow-xl min-h-[200px] sm:min-h-[280px] md:min-h-[320px] flex flex-col justify-center p-6 sm:p-10 md:p-14">
          {/* خلفية الصورة الثابتة abutP.jpeg */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/abutP.jpeg"
              alt="عن متجر الواسطة"
              fill
              priority
              className="object-cover object-center"
            />
            {/* أوفرلاي خفيف بنسبة متوازنة تبرز جمال الصورة والشعار مع ضمان وضوح النص */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/50 to-zinc-950/20" />
          </div>

          {/* محتوى البنر النصي */}
          <div className="relative z-10 max-w-xl space-y-2 sm:space-y-3">
            <span className="inline-block text-xs sm:text-sm font-bold text-purple-300 tracking-wide">
              متجر الواسطة للتقنية
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {pageData?.title || 'وجهتكم المعتمدة للتقنية والأجهزة الذكية'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-medium leading-relaxed">
              نلتزم بتقديم أحدث الهواتف ومعدات الشبكات والملحقات الأصلية بأعلى معايير الجودة والموثوقية.
            </p>
          </div>
        </div>

        {/* 3. نبذة تعريفية راقية وموجزة */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-2xs space-y-4">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              من نحن
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
              {pageData?.content || 'تأسس متجر الواسطة ليقدم تجربة تسوق إلكتروني موثوقة ومميزة في مجال الهواتف الذكية وحلول الشبكات الرقمية. نحرص على انتقاء المنتجات بعناية فائقة وتوفير أجهزة وملحقات أصلية معتمدة، مع التركيز التام على جودة المنتج وخدمة ما بعد البيع لضمان رضا عملائنا الدائم.'}
            </p>
          </div>

          {/* أرقام ومميزات بارزة وسريعة */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <div className="p-3 text-center sm:text-right">
              <span className="block text-xl sm:text-2xl font-black text-[var(--color-primary)]">100%</span>
              <span className="text-xs text-gray-500 font-medium">منتجات أصلية معتمدة</span>
            </div>
            <div className="p-3 text-center sm:text-right">
              <span className="block text-xl sm:text-2xl font-black text-[var(--color-primary)]">شحن سريع</span>
              <span className="text-xs text-gray-500 font-medium">توصيل آمن لجميع المناطق</span>
            </div>
            <div className="p-3 text-center sm:text-right">
              <span className="block text-xl sm:text-2xl font-black text-[var(--color-primary)]">أسعار منافسة</span>
              <span className="text-xs text-gray-500 font-medium">أفضل قيمة مقابل الجودة</span>
            </div>
            <div className="p-3 text-center sm:text-right">
              <span className="block text-xl sm:text-2xl font-black text-[var(--color-primary)]">دعم مستمر</span>
              <span className="text-xs text-gray-500 font-medium">تواصل مباشر لخدمتكم</span>
            </div>
          </div>
        </div>

        {/* 4. ركائزنا ومبادئ العمل */}
        <section className="space-y-5">
          <div className="border-b border-gray-200/80 pb-3">
            <h2 className="text-lg sm:text-xl font-black text-[var(--color-primary)]">
              قيمنا وركائز المتجر
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* الركيزة 1 */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-2 shadow-2xs hover:border-[var(--color-primary-soft)] transition">
              <h3 className="font-black text-[var(--color-primary)] text-base">الأصالة والضمان</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                كافة الأجهزة والملحقات المتوفرة لدينا أصلية ومطابقة لأعلى المواصفات القياسية.
              </p>
            </div>

            {/* الركيزة 2 */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-2 shadow-2xs hover:border-[var(--color-primary-soft)] transition">
              <h3 className="font-black text-[var(--color-primary)] text-base">أفضل الأسعار والعروض</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                نسعى دائماً لتقديم عروض مدروسة وأسعار منافسة تناسب مختلف الاحتياجات.
              </p>
            </div>

            {/* الركيزة 3 */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-2 shadow-2xs hover:border-[var(--color-primary-soft)] transition">
              <h3 className="font-black text-[var(--color-primary)] text-base">تغليف وشحن آمن</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                عناية دقيقة بتغليف المنتجات لضمان وصول أجهزتكم بأمان وسرعة تامة.
              </p>
            </div>

            {/* الركيزة 4 */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-2 shadow-2xs hover:border-[var(--color-primary-soft)] transition">
              <h3 className="font-black text-[var(--color-primary)] text-base">خدمة عملاء حقيقية</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                مساعدة ومتابعة مستمرة عبر الواتساب للإجابة على استفساراتكم ومساندتكم.
              </p>
            </div>

          </div>
        </section>

        {/* 5. دعوة للتسوق أو التواصل */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 text-center space-y-5 shadow-2xs">
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              جاهز لاكتشاف تشكيلة منتجاتنا؟
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              تصفح أحدث الهواتف الذكية والأجهزة والملحقات المتوفرة الآن في المتجر.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm hover:bg-[var(--color-primary-hover)] transition shadow-sm"
            >
              <span>تصفح المنتجات الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-gray-700 hover:text-gray-900 font-bold text-sm border border-gray-200 hover:bg-gray-50 transition"
            >
              <span>تواصل معنا</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}