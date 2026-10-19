// app/products/page.tsx
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { getCategories, getProducts } from '@/lib/appwrite/api';
import { Search, X, SlidersHorizontal, PackageOpen, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;
  const searchQuery = params.search;
  const currentSort = params.sort || 'newest';

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categoryId: selectedCategory,
      searchQuery,
      sortBy: currentSort,
    }),
  ]);

  const activeCategoryObj = categories.find(
    (c) => c.$id === selectedCategory || c.slug === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      
      {/* 1. رأس الصفحة المدمج والأنيق */}
      <div className="bg-white border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5">
          
          {/* مسار التصفح (Breadcrumb) */}
          <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 mb-2 sm:mb-2.5 font-medium">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
            <span className={activeCategoryObj ? 'hover:text-[var(--color-primary)]' : 'text-gray-900 font-bold'}>
              {activeCategoryObj ? (
                <Link href="/products">المنتجات</Link>
              ) : (
                'المنتجات'
              )}
            </span>
            {activeCategoryObj && (
              <>
                <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                <span className="text-[var(--color-primary)] font-bold">{activeCategoryObj.name}</span>
              </>
            )}
          </nav>

          {/* العنوان الرئيسي وشريط البحث */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {activeCategoryObj ? activeCategoryObj.name : 'كافة المنتجات'}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-purple-50 text-[var(--color-primary)] border border-purple-100">
                  {products.length} {products.length === 1 ? 'منتج' : 'منتجات'}
                </span>
              </div>
              <p className="hidden sm:block text-xs sm:text-sm text-gray-500 mt-1">
                تصفح أفضل الهواتف الذكية والأجهزة والملحقات الأصلية بأسعار منافسة
              </p>
            </div>

            {/* شريط البحث */}
            <div className="w-full sm:w-72 md:w-80 lg:w-96">
              <form method="GET" action="/products" className="relative">
                {selectedCategory && (
                  <input type="hidden" name="category" value={selectedCategory} />
                )}
                {currentSort !== 'newest' && (
                  <input type="hidden" name="sort" value={currentSort} />
                )}
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery || ''}
                  placeholder="ابحث باسم المنتج أو الموديل..."
                  className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                />
                <button
                  type="submit"
                  aria-label="بحث"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-primary)] transition"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {searchQuery && (
                  <Link
                    href={selectedCategory ? `/products?category=${selectedCategory}` : '/products'}
                    className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                    title="مسح البحث"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Link>
                )}
              </form>
            </div>
          </div>

          {/* 2. شريط تصنيفات المنتجات (Chips Bar) */}
          <div className="mt-3 pt-3 sm:mt-4 sm:pt-3.5 border-t border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              <Link
                href={searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products'}
                className={`whitespace-nowrap px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  !selectedCategory
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                }`}
              >
                جميع المنتجات
              </Link>

              {categories.map((cat) => {
                const isActive = selectedCategory === cat.$id || selectedCategory === cat.slug;
                const linkHref = searchQuery
                  ? `/products?category=${cat.slug || cat.$id}&search=${encodeURIComponent(searchQuery)}`
                  : `/products?category=${cat.slug || cat.$id}`;

                return (
                  <Link
                    key={cat.$id}
                    href={linkHref}
                    className={`whitespace-nowrap px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 3. شريط التحكم السريع وشبكة المنتجات */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        
        {/* شريط الفرز والترتيب - مدمج ومثالي للجوال والكمبيوتر */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 shadow-2xs">
          
          {/* الجانب الأيمن: عدد المنتجات */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-primary)] hidden xs:block" />
            <span>
              <strong className="text-gray-900 font-bold">{products.length}</strong> منتج
            </span>
          </div>

          {/* الجانب الأيسر: خيارات الترتيب بنظام Segmented Control متناسق */}
          <div className="flex items-center gap-1 bg-gray-100/90 p-0.5 sm:p-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-gray-600 overflow-x-auto">
            <Link
              href={`/products?${new URLSearchParams({
                ...(selectedCategory ? { category: selectedCategory } : {}),
                ...(searchQuery ? { search: searchQuery } : {}),
                sort: 'newest',
              }).toString()}`}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all ${
                currentSort === 'newest'
                  ? 'bg-white text-[var(--color-primary)] shadow-xs font-bold'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              الأحدث
            </Link>

            <Link
              href={`/products?${new URLSearchParams({
                ...(selectedCategory ? { category: selectedCategory } : {}),
                ...(searchQuery ? { search: searchQuery } : {}),
                sort: 'price_asc',
              }).toString()}`}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all ${
                currentSort === 'price_asc'
                  ? 'bg-white text-[var(--color-primary)] shadow-xs font-bold'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              الأقل سعراً
            </Link>

            <Link
              href={`/products?${new URLSearchParams({
                ...(selectedCategory ? { category: selectedCategory } : {}),
                ...(searchQuery ? { search: searchQuery } : {}),
                sort: 'price_desc',
              }).toString()}`}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all ${
                currentSort === 'price_desc'
                  ? 'bg-white text-[var(--color-primary)] shadow-xs font-bold'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              الأعلى سعراً
            </Link>
          </div>
        </div>

        {/* 4. شبكة المنتجات */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.$id} product={product} />
            ))}
          </div>
        ) : (
          /* حالة عدم وجود منتجات (Empty State) */
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 sm:gap-4 shadow-sm my-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center border border-purple-100">
              <PackageOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">لم يتم العثور على أي منتجات</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                {searchQuery
                  ? `لم نجد أي منتج يطابق عبارة البحث "${searchQuery}". حاول تجربة كلمات أخرى.`
                  : 'لا تتوفر منتجات في هذا القسم حالياً، يرجى تصفح بقية الأقسام.'}
              </p>
            </div>
            <Link
              href="/products"
              className="mt-1 sm:mt-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs sm:text-sm hover:bg-[var(--color-primary-hover)] transition shadow-sm"
            >
              عرض جميع المنتجات
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}