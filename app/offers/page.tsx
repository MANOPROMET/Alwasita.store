import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../components/ProductCard';
import { getDiscountedProducts, getLatestProducts } from '@/lib/appwrite/api';
import { Tag, ShoppingBag, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OffersPage() {
  const [discountedProducts, latestProducts] = await Promise.all([
    getDiscountedProducts(),
    getLatestProducts(12),
  ]);

  // إذا وُجدت منتجات عليها خصم مباشر تُعرض، وإلا تُعرض أحدث المنتجات كعروض حصرية بدلاً من ترك الصفحة فارغة
  const hasRealDiscounts = discountedProducts.length > 0;
  const displayProducts = hasRealDiscounts ? discountedProducts : latestProducts;

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
            <span className="text-gray-900 font-bold">العروض والتخفيضات</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 2. البنر الرئيسي الثابت بصورة OffersP.jpeg وبدون النص والأيقونة المحذوفة */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 shadow-xl min-h-[180px] sm:min-h-[240px] md:min-h-[280px] flex flex-col justify-center p-6 sm:p-10 md:p-14">
          {/* خلفية الصورة الثابتة OffersP.jpeg من مجلد public */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/OffersP.jpeg"
              alt="عروض وتخفيضات متجر الواسطة"
              fill
              priority
              className="object-cover object-center"
            />
            {/* تدرج لوني ناعم لضمان قراءة النصوص مع ظهور تفاصيل البنر */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
          </div>

          {/* محتوى البنر النصي */}
          <div className="relative z-10 max-w-xl space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              أقوى العروض والتخفيضات
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-medium leading-relaxed">
              وفّر أكثر مع خصومات وعروض متجر الواسطة الحصرية على الهواتف الذكية ومعدات الشبكات والإكسسوارات الأصلية.
            </p>
          </div>
        </div>

        {/* 3. سكشن كاردات العروض */}
        <section className="space-y-5">
          {/* عنوان السكشن */}
          <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-[var(--color-primary)] flex items-center justify-center border border-purple-100">
                <Tag className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                قائمة العروض المميزة
              </h2>
            </div>

            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-[var(--color-primary)] border border-purple-100">
              {displayProducts.length} {displayProducts.length === 1 ? 'منتج' : 'منتجات'}
            </span>
          </div>

          {/* شبكة كاردات العروض */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.$id} product={product} />
              ))}
            </div>
          ) : (
            /* في حال عدم وجود أي منتجات في المتجر */
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center border border-purple-100">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">لا توجد عروض حالياً</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  ترقبوا أحدث التخفيضات والعروض الخاصة قريباً في متجر الواسطة.
                </p>
              </div>
              <Link
                href="/products"
                className="mt-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm hover:bg-[var(--color-primary-hover)] transition shadow-sm"
              >
                تصفح جميع المنتجات
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}