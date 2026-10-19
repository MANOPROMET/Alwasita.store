'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  Smartphone,
  Tablet,
  BatteryCharging,
  Wifi,
  FileText,
  ShoppingCart,
} from 'lucide-react';

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

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [readTime, setReadTime] = useState('3 دقائق');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // ربط المنتج المقابل في المتجر
  const [productId, setProductId] = useState('');
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
      .catch((err) => console.error('Failed to load products for blog linking:', err));
  }, []);

  // صورة الغلاف
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlPreset, setImageUrlPreset] = useState<string>('/phoneP.jpeg');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '');
      setSlug(generated);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrlPreset('');
    }
  };

  // قوالب مواصفات الأجهزة الجاهزة
  const insertPhoneTemplate = () => {
    setCategory('مواصفات: الهواتف الذكية');
    setImageUrlPreset('/phoneP.jpeg');
    const template = `[SPECS_START]
المعالج: Qualcomm Snapdragon / Apple Bionic
الشاشة: 6.7 بوصة AMOLED بدقة 1080x2400 بكسل مع تردد 120Hz
البطارية: 5000 مللي أمبير مع شحن سريع 45W وشحن لاسلكي
الكاميرات: خلفية أساسية 50MP + عدسة واسعة 12MP | كاميرا أمامية 16MP
الذاكرة والرام: 8GB / 12GB RAM مع سعة تخزين 256GB / 512GB
الشبكات والاتصال: 5G، Wi-Fi 6، Bluetooth 5.3، دعم شريحتين الاتصال
المميزات: مقاوم للماء والغبار IP68، مستشعر بصمة مدمج بالشاشة، صوت ستريو نقي
السعر التقديري: يحدد حسب السوق والنسخة
[SPECS_END]

نظرة عامة على الهاتف:
هاتف متميز يقدم تجربة أداء رائدة وشاشة سريعة الاستجابة مع بطارية تدوم طوال اليوم تحت الاستخدام الشاق.

أبرز المميزات:
1. شاشة فائقة السلاسة والسطوع تحت الشمس.
2. كاميرا قوية تلتقط أدق التفاصيل وتصوير فيديو بدقة 4K.
3. بطارية ضخمة مع شحن فائق السرعة.`;
    setContent(template);
    if (!excerpt) {
      setExcerpt('المواصفات الكاملة للجهاز مع تفاصيل المعالج، الشاشة، البطارية، الكاميرات، والسعر التقديري.');
    }
  };

  const insertTabletTemplate = () => {
    setCategory('مواصفات: الأجهزة اللوحية');
    setImageUrlPreset('/TabletP.jpeg');
    const template = `[SPECS_START]
المعالج: معالج ثماني النواة عالي الأداء للدراسة والعمل والألعاب
الشاشة: 11.0 بوصة IPS LCD / OLED بدقة 2K وتردد 90Hz / 120Hz
البطارية: 8000 مللي أمبير تدوم حتى 12 ساعة تصفح وفيديو
الكاميرات: خلفية 13MP مع فلاش | أمامية 8MP محسنة لمكالمات الفيديو
الذاكرة والرام: 6GB / 8GB RAM مع سعة تخزين 128GB / 256GB
الشبكات والاتصال: Wi-Fi ثنائي التردد + خيار إضافة شريحة 4G/5G
المميزات: 4 مكبرات صوت ستريو Quad Speakers، دعم القلم الذكي ولوحة المفاتيح
السعر التقديري: يحدد حسب النسخة
[SPECS_END]

نظرة عامة على الجهاز اللوحي:
تابلت متكامل ومثالي للدراسة والعمل المكتبي وتصفح المحتوى مع بطارية عملاقة وصوت محيطي نقي.`;
    setContent(template);
  };

  const insertChargerTemplate = () => {
    setCategory('مواصفات: الشواحن وبنوك الطاقة');
    setImageUrlPreset('/whyP.jpeg');
    const template = `[SPECS_START]
المعالج: شريحة GaN الذكية لإدارة الحرارة وتوزيع الواط تلقائياً
الشاشة: شاشة رقمية LED توضح نسبة الشحن المتبقية والواط الخارج
البطارية: سعة حقيقية 20000mAh بخلايا ليثيوم بوليمر آمنة
الكاميرات: غير متوفر
الذاكرة والرام: غير متوفر
الشبكات والاتصال: منفذين Type-C (شحن فائق 65W/100W) + منفذ USB-A (22.5W QC)
المميزات: يدعم شحن اللابتوبات والهواتف معاً، مسموح به في الطائرات، حماية ضد الماس
السعر التقديري: يحدد حسب السعة والقوة
[SPECS_END]

نظرة عامة:
خازن طاقة فائق الأداء يشحن أجهزتك الذكية والكمبيوتر المحمول بأمان وسرعة أينما كنت.`;
    setContent(template);
  };

  const insertRouterTemplate = () => {
    setCategory('أجهزة الشبكات');
    setImageUrlPreset('/Network_devicesP.jpeg');
    const template = `[SPECS_START]
المعالج: معالج شبكي ثنائي النواة مخصص لمعالجة البيانات المكثفة
الشاشة: لمبات LED ذكية لتشخيص حالة الإنترنت والمنافذ
البطارية: محول طاقة كهربائية مستمر 12V موفر للطاقة
الكاميرات: غير متوفر
الذاكرة والرام: 128MB RAM لاستيعاب اتصال أكثر من 40 جهازاً دون بطء
الشبكات والاتصال: Wi-Fi 6 ثنائي النطاق (2.4GHz + 5GHz) بسرعة تصل 1800Mbps مع 4 منافذ Gigabit
المميزات: 4 هوائيات عالية الكسب 6dBi لتغطية أوسع واختراق الجدران، تقنية Mesh
السعر التقديري: يحدد حسب الموديل
[SPECS_END]

نظرة عامة على الراوتر:
راوتر منزلي ومكتبي متطور يقدم سرعات إنترنت فائقة واستقراراً تاماً في بث الإشارة لكافة الغرف.`;
    setContent(template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('عنوان المقال أو الجهاز مطلوب');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('محتوى المقال أو المواصفات مطلوب');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
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
      }

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrlPreset) {
        formData.append('imageUrl', imageUrlPreset);
      }

      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء حفظ المقال أو المواصفات');
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ المقال');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/blog"
            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لإدارة المدونة والمواصفات</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            إضافة تدوينة أو مواصفات جهاز
          </h1>
          <p className="text-xs text-gray-500">
            أضف مقالات إرشادية أو بطاقات مواصفات شاملة للهواتف والتابلت والشواحن والراوترات
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* شريط القوالب السريعة الذكية */}
      <div className="bg-purple-50/60 border border-purple-200/80 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>توليد قوالب المواصفات الجاهزة بنقرة واحدة (أفضل ممارسة لتنسيق مواصفات الأجهزة):</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={insertPhoneTemplate}
            className="px-3.5 py-2 bg-white hover:bg-purple-100/70 text-gray-800 rounded-xl text-xs font-bold border border-purple-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>قالب مواصفات هاتف ذكي</span>
          </button>

          <button
            type="button"
            onClick={insertTabletTemplate}
            className="px-3.5 py-2 bg-white hover:bg-purple-100/70 text-gray-800 rounded-xl text-xs font-bold border border-purple-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Tablet className="w-3.5 h-3.5 text-indigo-600" />
            <span>قالب جهاز لوحي (تابلت)</span>
          </button>

          <button
            type="button"
            onClick={insertChargerTemplate}
            className="px-3.5 py-2 bg-white hover:bg-purple-100/70 text-gray-800 rounded-xl text-xs font-bold border border-purple-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
            <span>قالب شاحن / بنك طاقة</span>
          </button>

          <button
            type="button"
            onClick={insertRouterTemplate}
            className="px-3.5 py-2 bg-white hover:bg-purple-100/70 text-gray-800 rounded-xl text-xs font-bold border border-purple-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Wifi className="w-3.5 h-3.5 text-blue-600" />
            <span>قالب راوتر / أجهزة شبكات</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* معلومات المقال / الجهاز */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              عنوان التدوينة أو اسم الجهاز *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="مثال: مواصفات هاتف سامسونج جالكسي S24 Ultra"
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                القسم والتصنيف
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
                placeholder="مثال: 3 دقائق"
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                الرابط المخصص (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="مثال: galaxy-s24-ultra-specs"
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              المقدمة أو ملخص سريع (Excerpt)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="سطرين يوضحان أهم مواصفات ومزايا الجهاز أو فكرة المقال..."
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 block">
                المحتوى وجدول المواصفات التفصيلي *
              </label>
              <span className="text-[11px] text-gray-400">
                يمكنك التعديل مباشرة على قيم المواصفات بين [SPECS_START] و [SPECS_END]
              </span>
            </div>
            <textarea
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تفاصيل المقال أو استخدم أزرار القوالب بالأعلى..."
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
            صورة الجهاز أو الغلاف
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
                  اضغط لرفع صورة جديدة من جهازك
                </span>
                <span className="text-[11px] text-gray-400 block">PNG, JPG, WebP</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-28 h-20 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                <Image
                  src={imagePreview || imageUrlPreset}
                  alt="معاينة الغلاف"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-800 block">
                  {imagePreview ? 'تم اختيار صورة مخصصة' : 'صورة القسم الافتراضية'}
                </span>
                <span className="text-[11px] text-gray-400 block">
                  أو اختر من صور الأقسام الجاهزة:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'هواتف', path: '/phoneP.jpeg' },
                    { label: 'لوحيات', path: '/TabletP.jpeg' },
                    { label: 'شواحن', path: '/whyP.jpeg' },
                    { label: 'شبكات', path: '/Network_devicesP.jpeg' },
                  ].map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setImageUrlPreset(preset.path);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${
                        imageUrlPreset === preset.path && !imagePreview
                          ? 'bg-purple-100 text-[var(--color-primary)] border-purple-200'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* خيارات النشر والتمييز */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded cursor-pointer"
              />
              <span>نشر في المدونة وقسم المواصفات (نشط)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded cursor-pointer"
              />
              <span>تثبيت في صدارة قسم المواصفات والمدونة</span>
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
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ ونشر التدوينة</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
