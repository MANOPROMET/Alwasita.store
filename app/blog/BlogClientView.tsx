'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  BookOpen,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { BlogPost } from '@/types';
import { getProductImageUrl } from '@/lib/appwrite/utils';

interface BlogClientViewProps {
  initialPosts: BlogPost[];
}

// قائمة التبويبات المعتمدة حسب طلب المتجر
const PRESET_CATEGORIES = [
  { id: 'general', label: 'أخبار ومقالات عامة', icon: '📰' },
  { id: 'phones', label: 'هواتف ذكية', icon: '📱' },
  { id: 'tablets', label: 'أجهزة لوحية', icon: '💻' },
  { id: 'chargers', label: 'شواحن وطاقة', icon: '🔋' },
  { id: 'networking', label: 'أجهزة الشبكات', icon: '🌐' },
];

export default function BlogClientView({ initialPosts }: BlogClientViewProps) {
  // التبويب الافتراضي هو "أخبار ومقالات عامة"
  const [selectedTag, setSelectedTag] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  // دالة تحديد ما إذا كان المنشور بطاقة مواصفات جهاز
  const isSpecItem = (post: BlogPost) => {
    const cat = (post.category || '').toLowerCase();
    const content = post.content || '';
    return Boolean(
      cat.includes('مواصفات') ||
      cat.includes('هواتف') ||
      cat.includes('لوحية') ||
      cat.includes('شواحن') ||
      cat.includes('شبكات') ||
      cat.includes('راوتر') ||
      content.includes('[SPECS_START]')
    );
  };

  // مطابقة المنشورات حسب التبويب المختار بدقة تامة
  const matchesCategory = (post: BlogPost, tag: string) => {
    const cat = (post.category || '').toLowerCase();

    // 1. تبويب أخبار ومقالات عامة: يمنع منعاً باتاً ظهور أي مواصفات لأي جهاز!
    if (tag === 'general') {
      return !isSpecItem(post);
    }

    // 2. تبويب الهواتف الذكية فقط
    if (tag === 'phones') {
      return cat.includes('هواتف') || cat.includes('phone');
    }

    // 3. تبويب الأجهزة اللوحية فقط
    if (tag === 'tablets') {
      return cat.includes('لوحية') || cat.includes('تابلت') || cat.includes('tablet');
    }

    // 4. تبويب الشواحن وبنوك الطاقة فقط
    if (tag === 'chargers') {
      return cat.includes('شواحن') || cat.includes('طاقة') || cat.includes('charger') || cat.includes('power');
    }

    // 5. تبويب أجهزة الشبكات فقط
    if (tag === 'networking') {
      return cat.includes('شبكات') || cat.includes('راوتر') || cat.includes('network') || cat.includes('router');
    }

    // أي تصنيف إضافي تم اختياره
    return post.category === tag;
  };

  // استخراج أي تصنيفات عامة مخصصة أضيفت يدوياً وتختلف عن التبويبات الرسمية
  const existingCategories = Array.from(
    new Set(initialPosts.map((p) => p.category).filter((c): c is string => Boolean(c)))
  );
  const customCategories = existingCategories.filter((cat) => {
    const c = cat.toLowerCase();
    const isStandard =
      c.includes('هواتف') ||
      c.includes('لوحية') ||
      c.includes('شواحن') ||
      c.includes('شبكات') ||
      c.includes('راوتر') ||
      c.includes('أخبار ومقالات عامة') ||
      c === 'عام';
    return !isStandard;
  });

  const filteredPosts = initialPosts.filter((post) => {
    const matchesTag = matchesCategory(post, selectedTag);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.title?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q) ||
      post.category?.toLowerCase().includes(q);
    return matchesTag && matchesSearch;
  });

  // اختيار المقال أو الجهاز المميز داخل نتائج التبويب المختار
  const featuredPost = filteredPosts.find((p) => p.isFeatured) || filteredPosts[0];

  const getImageSrc = (img?: string) => {
    if (!img) return '/whyP.jpeg';
    if (img.startsWith('/') || img.startsWith('http')) return img;
    return getProductImageUrl(img);
  };

  // معالجة عرض المحتوى في النافذة المنبثقة
  const renderModalContent = (post: BlogPost) => {
    if (!post.content) return null;
    const isSpec = isSpecItem(post);

    if (isSpec && post.content.includes('[SPECS_START]')) {
      const startIdx = post.content.indexOf('[SPECS_START]');
      const endIdx = post.content.indexOf('[SPECS_END]');
      const specsBlock = post.content.slice(startIdx + '[SPECS_START]'.length, endIdx).trim();
      const descBlock = (post.content.slice(0, startIdx) + '\n' + post.content.slice(endIdx + '[SPECS_END]'.length)).trim();

      const lines = specsBlock.split('\n').map((l) => l.trim()).filter(Boolean);

      return (
        <div className="space-y-6">
          {lines.length > 0 && (
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
              <span className="text-xs font-black text-[var(--color-primary)] block">
                ⚡ المواصفات الفنية الرئيسية:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {lines.map((line, i) => {
                  const colon = line.indexOf(':');
                  if (colon > -1) {
                    return (
                      <div key={i} className="bg-white p-2.5 rounded-xl border border-purple-100/80 flex items-center justify-between">
                        <span className="text-gray-400 font-bold">{line.slice(0, colon).trim()}</span>
                        <span className="font-black text-gray-900">{line.slice(colon + 1).trim()}</span>
                      </div>
                    );
                  }
                  return <div key={i} className="text-gray-700">{line}</div>;
                })}
              </div>
            </div>
          )}

          {descBlock && (
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {descBlock}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      
      {/* المقال / الجهاز المميز داخل القسم المختار في الأعلى */}
      {featuredPost && !searchQuery && (
        <div
          onClick={() => setActiveArticle(featuredPost)}
          className="group cursor-pointer bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          <div className="relative w-full h-64 sm:h-80 lg:h-full min-h-[260px] lg:col-span-6 bg-zinc-900 overflow-hidden">
            <Image
              src={getImageSrc(featuredPost.image)}
              alt={featuredPost.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 bg-purple-900/90 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSpecItem(featuredPost) ? 'مواصفات مميزة 🔥' : 'مقال مميز 🔥'}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="font-bold text-[var(--color-primary)] bg-purple-50 px-2.5 py-1 rounded-lg">
                {featuredPost.category || 'أخبار ومقالات عامة'}
              </span>
              {isSpecItem(featuredPost) && (
                <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  ⚡ بطاقة مواصفات
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {featuredPost.$createdAt
                  ? new Date(featuredPost.$createdAt).toLocaleDateString('ar-YE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'حديث'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {featuredPost.readTime || '3 دقائق'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-[var(--color-primary)] transition-colors leading-snug">
              {featuredPost.title}
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3">
              {featuredPost.excerpt}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[var(--color-primary)] group-hover:underline">
                <span>{isSpecItem(featuredPost) ? 'معاينة المواصفات السريعة' : 'قراءة المقال كاملاً'}</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </span>

              <Link
                href={`/blog/${encodeURIComponent(featuredPost.slug || featuredPost.$id)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[var(--color-primary)] px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 transition"
              >
                <span>فتح صفحة مستقلة</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* شريط الفلاتر والبحث */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-3xl border border-gray-200/80 shadow-2xs">
          
          {/* تبويبات الأقسام والمواصفات */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedTag(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  selectedTag === cat.id
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}

            {customCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedTag(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedTag === cat
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>📌</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* خانة البحث */}
          <div className="relative w-full md:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المقالات والأجهزة..."
              className="w-full px-4 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute top-2.5 right-3" />
          </div>
        </div>
      </div>

      {/* شبكة المقالات أو الأجهزة */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isSpec = isSpecItem(post);
            const targetUrl = `/blog/${encodeURIComponent(post.slug || post.$id)}`;

            return (
              <div
                key={post.$id}
                onClick={() => setActiveArticle(post)}
                className="group cursor-pointer bg-white rounded-3xl border border-gray-200/80 shadow-2xs hover:shadow-lg hover:border-purple-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-48 bg-zinc-900 overflow-hidden">
                    <Image
                      src={getImageSrc(post.image)}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 text-[11px] font-bold bg-black/60 text-white px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                      {post.category || (isSpec ? 'مواصفات' : 'عام')}
                    </span>

                    {isSpec && (
                      <span className="absolute bottom-3 right-3 text-[10px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        ⚡ مواصفات فنية
                      </span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.$createdAt
                          ? new Date(post.$createdAt).toLocaleDateString('ar-YE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'حديث'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime || '3 دقائق'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-gray-100/80 mt-auto">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)]">
                    <span>{isSpec ? 'عرض المواصفات' : 'قراءة المقال'}</span>
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  </span>

                  <Link
                    href={targetUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-[var(--color-primary)] px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-purple-50 transition border border-gray-100"
                  >
                    <span>فتح صفحة مستقلة</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-base font-bold text-gray-900">
            {selectedTag === 'general'
              ? 'لا توجد مقالات أو أخبار عامة حالياً'
              : selectedTag === 'phones'
              ? 'لا توجد هواتف مضافة في قسم المواصفات حالياً'
              : selectedTag === 'tablets'
              ? 'لا توجد أجهزة لوحية مضافة في هذا القسم حالياً'
              : selectedTag === 'chargers'
              ? 'لا توجد شواحن وبنوك طاقة مضافة في هذا القسم حالياً'
              : selectedTag === 'networking'
              ? 'لا توجد أجهزة شبكات مضافة في هذا القسم حالياً'
              : 'لا توجد عناصر مطابقة'}
          </h4>
          <p className="text-xs text-gray-500">
            يمكنك الاطلاع على الأقسام الأخرى من شريط التبويبات بالأعلى
          </p>
        </div>
      )}

      {/* نافذة القراءة والمعاينة السريعة (Modal) */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-primary)] bg-purple-50 px-2.5 py-1 rounded-lg">
                  {activeArticle.category || 'عام'}
                </span>
                {isSpecItem(activeArticle) && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    ⚡ بطاقة مواصفات
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                {activeArticle.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{activeArticle.readTime || '3 دقائق'} قراءة ومعاينة</span>
              </div>
            </div>

            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-zinc-900">
              <Image
                src={getImageSrc(activeArticle.image)}
                alt={activeArticle.title}
                fill
                className="object-cover"
              />
            </div>

            {/* تفاصيل المحتوى أو المواصفات */}
            {renderModalContent(activeArticle)}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <Link
                href={`/blog/${encodeURIComponent(activeArticle.slug || activeArticle.$id)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition shadow-xs"
              >
                <span>الانتقال لصفحة المقال الكاملة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
