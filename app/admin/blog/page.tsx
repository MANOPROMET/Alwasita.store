import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts, getProductImageUrl } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/server';
import { revalidatePath } from 'next/cache';
import {
  BookOpen,
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ status?: string; query?: string }>;
}

export default async function AdminBlogPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams?.status || 'all';
  const searchQuery = resolvedParams?.query || '';

  const allPosts = await getBlogPosts({ includeInactive: true });

  const activeCount = allPosts.filter((p) => p.isActive).length;
  const draftCount = allPosts.filter((p) => !p.isActive).length;

  const filteredPosts = allPosts.filter((post) => {
    if (statusFilter === 'active' && !post.isActive) return false;
    if (statusFilter === 'draft' && post.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchCat = post.category?.toLowerCase().includes(q);
      return matchTitle || matchCat;
    }
    return true;
  });

  // حذف مقال عبر سيرفر آكشن
  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await databases.deleteDocument(DATABASE_ID, 'blog_posts', id);
      revalidatePath('/admin/blog');
      revalidatePath('/blog');
    }
  }

  // تبديل حالة النشر
  async function handleToggleStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentVal = formData.get('currentVal') === 'true';
    if (id) {
      await databases.updateDocument(DATABASE_ID, 'blog_posts', id, {
        isActive: !currentVal,
      });
      revalidatePath('/admin/blog');
      revalidatePath('/blog');
    }
  }

  // تبديل حالة المقال المميز
  async function handleToggleFeatured(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentVal = formData.get('currentVal') === 'true';
    if (id) {
      await databases.updateDocument(DATABASE_ID, 'blog_posts', id, {
        isFeatured: !currentVal,
      });
      revalidatePath('/admin/blog');
      revalidatePath('/blog');
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              إدارة مقالات المدونة
            </h1>
            <span className="text-xs font-bold bg-purple-50 text-[var(--color-primary)] px-2.5 py-1 rounded-full border border-purple-100">
              {allPosts.length} مقال
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            أضف مقالات إرشادية وتثقيفية للعملاء، وتحكم في نشر وتعديل المقالات بسهولة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl border border-gray-200 transition flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>معاينة في المتجر</span>
          </Link>

          <Link
            href="/admin/blog/new"
            className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مقال جديد</span>
          </Link>
        </div>
      </div>

      {/* شريط الإحصائيات والفلاتر */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الكل ({allPosts.length})
          </Link>
          <Link
            href="/admin/blog?status=active"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            المنشورة ({activeCount})
          </Link>
          <Link
            href="/admin/blog?status=draft"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'draft'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            المسودات والمخفية ({draftCount})
          </Link>
        </div>

        <div className="text-xs text-gray-400 font-medium">
          المقالات تظهر في واجهة المتجر وقسم المدونة
        </div>
      </div>

      {/* جدول المقالات */}
      {filteredPosts.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-xs font-black text-gray-500 uppercase">
                  <th className="py-4 px-6">المقال</th>
                  <th className="py-4 px-6">التصنيف</th>
                  <th className="py-4 px-6 text-center">مميز</th>
                  <th className="py-4 px-6 text-center">حالة النشر</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {filteredPosts.map((post) => {
                  const imageSrc = post.image?.startsWith('/') || post.image?.startsWith('http')
                    ? post.image
                    : post.image
                    ? getProductImageUrl(post.image)
                    : '/whyP.jpeg';

                  const postDate = post.$createdAt
                    ? new Date(post.$createdAt).toLocaleDateString('ar-YE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'حديث';

                  return (
                    <tr key={post.$id} className="hover:bg-purple-50/15 transition">
                      
                      {/* تفاصيل المقال */}
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className="relative w-16 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          <Image
                            src={imageSrc}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
                            {post.title}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {postDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.readTime || '3 دقائق'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* التصنيف */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          {post.category || 'عام'}
                        </span>
                      </td>

                      {/* مميز */}
                      <td className="py-4 px-6 text-center">
                        <form action={handleToggleFeatured} className="inline-block">
                          <input type="hidden" name="id" value={post.$id} />
                          <input type="hidden" name="currentVal" value={String(Boolean(post.isFeatured))} />
                          <button
                            type="submit"
                            title={post.isFeatured ? 'إلغاء التمييز' : 'تعيين كمقال مميز في الواجهة'}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              post.isFeatured
                                ? 'bg-purple-100 text-[var(--color-primary)] border-purple-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-700'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </form>
                      </td>

                      {/* حالة النشر التفاعلية */}
                      <td className="py-4 px-6 text-center">
                        <form action={handleToggleStatus} className="inline-block">
                          <input type="hidden" name="id" value={post.$id} />
                          <input type="hidden" name="currentVal" value={String(Boolean(post.isActive))} />
                          <button
                            type="submit"
                            title={post.isActive ? 'المقال منشور للعملاء، انقر للتحويل إلى مسودة' : 'المقال مسودة مخفية، انقر للنشر'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer border ${
                              post.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            {post.isActive ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>منشور في المدونة</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                                <span>مسودة (مخفي)</span>
                              </>
                            )}
                          </button>
                        </form>
                      </td>

                      {/* الإجراءات */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/blog/edit/${post.$id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-purple-50 rounded-xl transition"
                            title="تعديل المقال"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <form action={handleDelete}>
                            <input type="hidden" name="id" value={post.$id} />
                            <button
                              type="submit"
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                              title="حذف المقال"
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
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">لا توجد مقالات مطابقة حالياً</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            قم بإضافة أول مقال تثقيفي لعملائك لزيادة ثقة المشتري وتوضيح نصائح الأجهزة الذكية وشبكات الاتصال.
          </p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--color-primary-hover)] transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مقال جديد الآن</span>
          </Link>
        </div>
      )}

    </div>
  );
}
