import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories, deleteProduct, getProductImageUrl } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/server';
import { Plus, ArrowRight, Trash2, Edit, PackageOpen, Search, Filter, Eye, EyeOff, Sparkles, Flame } from 'lucide-react';
import { revalidatePath } from 'next/cache';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ query?: string; category?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.query || '';
  const categoryId = resolvedParams?.category || '';
  const statusFilter = resolvedParams?.status || 'all';

  // جلب الأقسام والمنتجات (بما فيها المخفية) مع تطبيق معايير البحث والفلترة
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts({
      searchQuery: searchQuery,
      categoryId: categoryId !== '' ? categoryId : undefined,
      includeInactive: true,
    }),
  ]);

  const activeCount = allProducts.filter((p) => p.isActive).length;
  const hiddenCount = allProducts.filter((p) => !p.isActive).length;

  const products = allProducts.filter((p) => {
    if (statusFilter === 'active') return p.isActive;
    if (statusFilter === 'hidden') return !p.isActive;
    return true;
  });

  // دالة الحذف عبر السيرفر
  async function handleDelete(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;
    if (productId) {
      // استدعاء الحذف مع إعادة التحقق
      await deleteProduct(productId);
      revalidatePath('/admin/products');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/offers');
    }
  }

  // تبديل حالة "الأكثر طلباً" مباشرة
  async function handleToggleFeatured(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;
    const currentVal = formData.get('currentVal') === 'true';
    if (productId) {
      await databases.updateDocument(DATABASE_ID, 'products', productId, {
        isFeatured: !currentVal,
      });
      revalidatePath('/admin/products');
      revalidatePath('/');
    }
  }

  // تبديل حالة "العروض" مباشرة
  async function handleToggleOffer(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;
    const currentVal = formData.get('currentVal') === 'true';
    if (productId) {
      await databases.updateDocument(DATABASE_ID, 'products', productId, {
        isOffer: !currentVal,
      });
      revalidatePath('/admin/products');
      revalidatePath('/');
      revalidatePath('/offers');
    }
  }

  // تبديل حالة الظهور في المتجر (نشط / مخفي) مباشرة
  async function handleToggleActive(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;
    const currentVal = formData.get('currentVal') === 'true';
    if (productId) {
      await databases.updateDocument(DATABASE_ID, 'products', productId, {
        isActive: !currentVal,
      });
      revalidatePath('/admin/products');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/offers');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>لوحة التحكم الرئيسية</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">إدارة المنتجات</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            إجمالي المنتجات المطابقة في المتجر:{' '}
            <span className="font-bold text-gray-900">{products.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </Link>
        </div>
      </div>

      {/* شريط البحث وفلاتر الأقسام */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs space-y-4">
        
        {/* صندوق البحث */}
        <form method="GET" className="flex items-center gap-2">
          {categoryId && <input type="hidden" name="category" value={categoryId} />}
          <div className="relative w-full">
            <input
              type="text"
              name="query"
              defaultValue={searchQuery}
              placeholder="ابحث عن اسم المنتج واضغط Enter..."
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800 transition shrink-0 cursor-pointer"
          >
            بحث
          </button>
        </form>

        {/* فلاتر حالة العرض (الكل / معروض / مخفي) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-gray-100 pb-2 scrollbar-none">
          <span className="text-xs font-bold text-gray-500 ml-2 shrink-0">حالة العرض:</span>

          <Link
            href={`/admin/products?${new URLSearchParams({
              ...(searchQuery ? { query: searchQuery } : {}),
              ...(categoryId ? { category: categoryId } : {}),
              status: 'all',
            }).toString()}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الكل ({allProducts.length})
          </Link>

          <Link
            href={`/admin/products?${new URLSearchParams({
              ...(searchQuery ? { query: searchQuery } : {}),
              ...(categoryId ? { category: categoryId } : {}),
              status: 'active',
            }).toString()}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>معروض للعملاء ({activeCount})</span>
          </Link>

          <Link
            href={`/admin/products?${new URLSearchParams({
              ...(searchQuery ? { query: searchQuery } : {}),
              ...(categoryId ? { category: categoryId } : {}),
              status: 'hidden',
            }).toString()}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'hidden'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>مخفي من المتجر ({hiddenCount})</span>
          </Link>
        </div>

        {/* فلاتر الأقسام */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
          <span className="text-xs font-bold text-gray-500 ml-2 shrink-0">الأقسام:</span>

          <Link
            href={`/admin/products${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              !categoryId
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            كل الأقسام
          </Link>

          {categories.map((cat) => {
            const isSelected = categoryId === cat.$id || categoryId === cat.slug;
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.set('query', searchQuery);
            queryParams.set('category', cat.$id);

            return (
              <Link
                key={cat.$id}
                href={`/admin/products?${queryParams.toString()}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

      </div>

      {/* جدول المنتجات */}
      {products.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/70 text-xs font-black text-gray-500 uppercase">
                  <th className="py-4 px-6">المنتج</th>
                  <th className="py-4 px-6">السعر الأساسي</th>
                  <th className="py-4 px-6 text-center">الأكثر طلباً / العروض</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {products.map((product) => {
                  const rawImage = product.images?.[0] as any;
                  const rawFileId =
                    typeof rawImage === 'string' && rawImage.trim() !== ''
                      ? rawImage
                      : rawImage?.fileId || product.mainImageFileId || '';
                  const imageUrl = getProductImageUrl(rawFileId);

                  return (
                    <tr key={product.$id} className="hover:bg-purple-50/15 transition">
                      
                      {/* تفاصيل المنتج والصورة */}
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-200 p-1">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm sm:text-base">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[11px] text-gray-400 font-mono">
                              ID: {product.$id}
                            </span>
                            {product.conditionLabel && (
                              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                                product.condition === 'used'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {product.conditionLabel}
                              </span>
                            )}
                            {product.variants && product.variants.length > 0 && (
                              <span className="text-[11px] bg-purple-50 text-primary-700 px-2 py-0.5 rounded-md font-bold">
                                {product.variants.length} خيارات/سعات
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* السعر */}
                      <td className="py-4 px-6">
                        <div className="font-black text-gray-900 text-base">
                          {Number(product.price).toLocaleString('ar-SA')}{' '}
                          <span className="text-xs font-bold text-gray-500">ر.س</span>
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-xs text-rose-500 line-through">
                            {Number(product.compareAtPrice).toLocaleString('ar-SA')} ر.س
                          </div>
                        )}
                      </td>

                      {/* التمييز في الأكثر طلباً والعروض */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* زر تبديل الأكثر طلباً */}
                          <form action={handleToggleFeatured}>
                            <input type="hidden" name="productId" value={product.$id} />
                            <input
                              type="hidden"
                              name="currentVal"
                              value={String(Boolean(product.isFeatured))}
                            />
                            <button
                              type="submit"
                              title={
                                product.isFeatured
                                  ? 'إزالة من تبويب الأكثر طلباً'
                                  : 'تمييز في تبويب الأكثر طلباً بالرئيسية'
                              }
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                                product.isFeatured
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                                  : 'bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>{product.isFeatured ? 'الأكثر طلباً' : 'عادي'}</span>
                            </button>
                          </form>

                          {/* زر تبديل العروض */}
                          <form action={handleToggleOffer}>
                            <input type="hidden" name="productId" value={product.$id} />
                            <input
                              type="hidden"
                              name="currentVal"
                              value={String(Boolean(product.isOffer))}
                            />
                            <button
                              type="submit"
                              title={
                                product.isOffer
                                  ? 'إزالة من قسم وصفحة العروض'
                                  : 'إضافة إلى قسم وصفحة العروض والتخفيضات'
                              }
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                                product.isOffer
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                                  : 'bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <Flame className="w-3.5 h-3.5 text-rose-500" />
                              <span>{product.isOffer ? 'في العروض' : 'إضافة لعرض'}</span>
                            </button>
                          </form>
                        </div>
                      </td>

                      {/* الحالة مع إمكانية التبديل بنقرة واحدة */}
                      <td className="py-4 px-6">
                        <form action={handleToggleActive}>
                          <input type="hidden" name="productId" value={product.$id} />
                          <input
                            type="hidden"
                            name="currentVal"
                            value={String(Boolean(product.isActive))}
                          />
                          <button
                            type="submit"
                            title={
                              product.isActive
                                ? 'المنتج معروض في المتجر حالياً، انقر لإخفائه'
                                : 'المنتج مخفي من المتجر، انقر لإعادة عرضه للعملاء'
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer border ${
                              product.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            {product.isActive ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>معروض في المتجر</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                                <span>مخفي من العرض</span>
                              </>
                            )}
                          </button>
                        </form>
                      </td>

                      {/* الإجراءات: معاينة، تعديل، حذف */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* معاينة المنتج في المتجر */}
                          <Link
                            href={`/products/${product.$id}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                            title="معاينة في المتجر"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* تعديل المنتج */}
                          <Link
                            href={`/admin/products/edit/${product.$id}`}
                            className="p-2 rounded-xl bg-purple-50 text-primary-600 hover:bg-primary-600 hover:text-white transition"
                            title="تعديل تفاصيل المنتج والأسعار"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* حذف المنتج */}
                          <form action={handleDelete}>
                            <input type="hidden" name="productId" value={product.$id} />
                            <button
                              type="submit"
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                              title="حذف المنتج نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4 border border-gray-200/70">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-primary-400">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">
              لا توجد منتجات مطابقة لبحثك أو للقسم المحدد
            </h3>
            <p className="text-xs text-gray-500">جرب اختيار قسم آخر أو تغيير كلمة البحث.</p>
          </div>
        </div>
      )}

    </div>
  );
}