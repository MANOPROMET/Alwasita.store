// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import HeroProductSlider from './components/HeroProductSlider';
import CategoryGrid from './components/CategoryGrid';
import HomeShowcase from './components/HomeShowcase';
import {
  getCategories,
  getFeaturedProducts,
  getLatestProducts,
  getDiscountedProducts,
  getBanners,
  getPromoBanner,
  getProducts,
} from '@/lib/appwrite/api';
import { getProductImageUrl } from '@/lib/appwrite/utils';
import {
  ShieldCheck,
  Truck,
  MessageCircle,
  Tag,
} from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const [
    categories,
    featuredProducts,
    latestProducts,
    discountedProducts,
    heroBanners,
    promoBanner,
    allProducts,
  ] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getLatestProducts(8),
    getDiscountedProducts(),
    getBanners('hero'),
    getPromoBanner(),
    getProducts(),
  ]);

  const whatsappPhone = '967771211394';

  // تجهيز بيانات البنر الثابت (الترويجي)
  const promoImage = promoBanner?.imageFileId
    ? getProductImageUrl(promoBanner.imageFileId)
    : '/OffersP.jpeg';
  const promoTitle = promoBanner?.title || 'صفقات وتخفيضات اليوم';
  const promoBadge = promoBanner?.subtitle?.includes('|')
    ? promoBanner.subtitle.split('|')[0].trim()
    : 'خصومات حصرية';
  const promoDesc = promoBanner?.subtitle?.includes('|')
    ? promoBanner.subtitle.split('|')[1].trim()
    : (promoBanner?.subtitle || 'تصفح المنتجات المخفضة لفترة محدودة');
  const promoLink = promoBanner?.linkValue || '/offers';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* 1. البنر الأول التفاعلي: يعرض السلايدر التفاعلي المتحكم به بالكامل من لوحة الأدمن */}
      <section>
        <HeroProductSlider
          banners={heroBanners}
          latestProducts={latestProducts}
          allProducts={allProducts}
        />
      </section>

      {/* 2. البنر الثاني الثابت: عروض وتخفيضات قابل للتخصيص من لوحة الأدمن */}
      <section>
        <Link
          href={promoLink}
          className="group relative overflow-hidden rounded-3xl border border-purple-500/30 shadow-md min-h-[160px] sm:min-h-[220px] flex flex-col justify-center p-8 transition hover:border-[var(--color-primary)]"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src={promoImage}
              alt={promoTitle}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-md space-y-2">
            <span className="text-xs font-black text-purple-300 bg-purple-500/30 px-3 py-1 rounded-full backdrop-blur-sm border border-purple-400/20">
              {promoBadge}
            </span>
            <h4 className="text-2xl font-black text-white">{promoTitle}</h4>
            <p className="text-sm text-zinc-300">{promoDesc}</p>
          </div>
        </Link>
      </section>

      {/* 3. الأقسام الرئيسية بصورها المخصصة */}
      {categories.length > 0 && (
        <section>
          <CategoryGrid categories={categories} />
        </section>
      )}

      {/* 4. معرض المنتجات المميزة */}
      <section>
        <HomeShowcase
          featuredProducts={featuredProducts}
          latestProducts={latestProducts}
          discountedProducts={discountedProducts}
        />
      </section>

      {/* 5. قسم لماذا تختار متجر الواسطة بخلفية الصورة whyP.jpeg وأوفرلاي خفيف بنسبة 20% */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 p-6 sm:p-10 shadow-xl">
        {/* خلفية الصورة whyP.jpeg */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/whyP.jpeg"
            alt="لماذا تختار متجر الواسطة"
            fill
            className="object-cover object-center"
          />
          {/* أوفرلاي خفيف بنسبة 20% لإظهار الصورة بوضوح مع الحفاظ على مقروئية البطاقات */}
          <div className="absolute inset-0 bg-zinc-950/20" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h4 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              لماذا تختار متجر الواسطة؟
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              نحرص على تقديم أفضل تجربة تسوق إلكتروني مع ضمانات متكاملة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md shadow-md hover:border-purple-500/40 transition">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm text-white">منتجات أصلية 100%</h5>
                <p className="text-xs text-zinc-300 leading-relaxed">ضمان معتمد على كافة الأجهزة المعروضة</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md shadow-md hover:border-purple-500/40 transition">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/30">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm text-white">شحن آمن وسريع</h5>
                <p className="text-xs text-zinc-300 leading-relaxed">توصيل دقيق لكافة المحافظات والمناطق</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md shadow-md hover:border-purple-500/40 transition">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/30">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm text-white">دعم فوري ومباشر</h5>
                <p className="text-xs text-zinc-300 leading-relaxed">خدمة عملاء متجاوبة لخدمتك دائماً</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md shadow-md hover:border-purple-500/40 transition">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/30">
                <Tag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm text-white">أسعار منافسة</h5>
                <p className="text-xs text-zinc-300 leading-relaxed">عروض وتحديثات مستمرة تناسب ميزانيتك</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. بنر التواصل والطلب المباشر عبر واتساب (في نهاية الصفحة) */}
      <section>
        <a
          href={`https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent('مرحباً متجر الواسطة، أرغب بالاستفسار عن الأجهزة والمنتجات المتاحة')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-3xl border border-emerald-500/30 shadow-lg p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:border-emerald-400"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg sm:text-xl font-black text-white">الطلب والتواصل عبر واتساب</h4>
              <p className="text-xs sm:text-sm text-zinc-300">تحدث مع المبيعات واستفسر عن المواصفات فوراً</p>
            </div>
          </div>
          <div className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow transition shrink-0 group-hover:bg-emerald-500">
            تواصل معنا الآن
          </div>
        </a>
      </section>

    </div>
  );
}