'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  Smartphone,
  Tablet,
  BatteryCharging,
  Wifi,
  ShoppingCart,
} from 'lucide-react';
import { BlogPost } from '@/types';
import { getProductImageUrl } from '@/lib/appwrite/utils';

const CATEGORY_PRESETS = [
  'أخبار ومقالات عامة',
  'مواصفات: الهواتف الذكية',
  'مواصفات: الأجهزة اللوحية',
  'مواصفات: الشواحن وبنوك الطاقة',
  'أجهزة الشبكات',
  'إرشادات الشراء',
  'نصائح وحماية',
  'صيانة وعناية',
  'عام',
];

export default function EditBlogForm({ post }: { post: BlogPost }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState(post.title || '');
  const [slug, setSlug] = useState(post.slug || '');
  const [category, setCategory] = useState(post.category || CATEGORY_PRESETS[0]);
  const [readTime, setReadTime] = useState(post.readTime || '3 دقائق');
  const [excerpt, setExcerpt] = useState(post.excerpt || '');
  const [content, setContent] = useState(post.content || '');
  const [isActive, setIsActive] = useState(Boolean(post.isActive));
  const [isFeatured, setIsFeatured] = useState(Boolean(post.isFeatured));

  // ربط المنتج المقابل في المتجر
  const [productId, setProductId] = useState(post.productId || post.product_id || '');
  const [availableProducts, setAvailableProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products) {
          setAvailableProducts(
            data.products.map((p: any) => ({
              id: p.$id,
              name: p.name,
              price: p.price,
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  // صورة الغلاف
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlPreset, setImageUrlPreset] = useState<string>(post.image || '/whyP.jpeg');

  const currentDisplayImage = imagePreview
    ? imagePreview
    : imageUrlPreset?.startsWith('/') || imageUrlPreset?.startsWith('http')
    ? imageUrlPreset
    : getProductImageUrl(imageUrlPreset);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const insertSpecsSkeleton = () => {
    const skeleton = `[SPECS_START]
المعالج: 
الشاشة: 
البطارية: 
الكاميرات: 
الذاكرة والرام: 
الشبكات والاتصال: 
المميزات: 
السعر التقديري: 
[SPECS_END]

تفاصيل الجهاز والمراجعة:
`;
    setContent((prev) => (prev ? `${prev}\n\n${skeleton}` : skeleton));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('عنوان المقال مطلوب');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('محتوى المقال مطلوب');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('id', post.$id);
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('category', category);
      formData.append('readTime', readTime);
      formData.append('excerpt', excerpt);
      formData.append('content', content);
      formData.append('isActive', String(isActive));
      formData.append('isFeatured', String(isFeatured));

      if (productId.trim()) {
        formData.append('productId', productId.trim());
        formData.append('product_id', productId.trim());
      } else {
        formData.append('productId', '');
        formData.append('product_id', '');
      }

      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('imageUrl', imageUrlPreset);
      }

      const res = await fetch('/api/admin/blog', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء تعديل المقال');
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      console.error('Error updating post:', err);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ المقال');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* معلومات المقال */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block">
            عنوان التدوينة أو اسم الجهاز *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              التصنيف
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition cursor-pointer"
            >
              {CATEGORY_PRESETS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              وقت القراءة
            </label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              الرابط (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block">
            المقدمة والمختصر (Excerpt)
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 block">
              نص ومحتوى المقال أو جدول المواصفات *
            </label>
            <button
              type="button"
              onClick={insertSpecsSkeleton}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>إدراج قالب مواصفات سريع</span>
            </button>
          </div>
          <textarea
            rows={12}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition resize-y"
          />
        </div>
      </div>

      {/* ربط التدوينة أو المواصفات بمنتج في المتجر */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[var(--color-primary)]" />
              <span>ربط المقال بمنتج في المتجر (تحويل القارئ إلى مشتري)</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              عند ربط المقال بمنتج، سيظهر زر رئيسي مباشر "طلب المنتج الآن" في أسفل المقال وفي بطاقة المواصفات
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 block">
            اختر المنتج المرتبط من معروضات المتجر (اختياري)
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition cursor-pointer"
          >
            <option value="">-- بدون ربط بمنتج محدد (مقال إرشادي أو عام) --</option>
            {availableProducts.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name} {prod.price ? `(${prod.price} $)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* صورة الغلاف */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
        <label className="text-xs font-bold text-gray-700 block">
          صورة الغلاف أو صورة الجهاز
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="border-2 border-dashed border-gray-200 hover:border-primary-400 bg-gray-50/50 rounded-2xl p-6 text-center transition cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-1 pointer-events-none">
              <ImageIcon className="w-8 h-8 text-[var(--color-primary)] mx-auto" />
              <span className="text-xs font-bold text-gray-800 block">
                اضغط لتغيير الصورة الحالية
              </span>
              <span className="text-[11px] text-gray-400 block">PNG, JPG, WebP</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-32 h-20 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
              <Image
                src={currentDisplayImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-800 block">
                {imagePreview ? 'تم اختيار صورة جديدة' : 'الصورة المحفوظة حالياً'}
              </span>
              <span className="text-[11px] text-gray-400 block">
                تظهر في بطاقة المقال والصفحة الخاصة به
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* خيارات النشر */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded cursor-pointer"
            />
            <span>نشر المقال للعملاء في المدونة</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded cursor-pointer"
            />
            <span>تثبيت كمقال مميز</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري حفظ التعديلات...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>

    </form>
  );
}
