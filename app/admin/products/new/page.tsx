'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { databases } from '@/lib/appwrite/client';
import {
  ArrowRight,
  PlusCircle,
  Loader2,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Tag,
  Palette,
  Layers,
} from 'lucide-react';

import KeySpecsEditor, { SpecItem, SPEC_TEMPLATES } from '../components/KeySpecsEditor';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  colorName: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // بيانات المنتج الأساسية
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOffer, setIsOffer] = useState(false);
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [conditionLabel, setConditionLabel] = useState('جديد');

  // المواصفات الأساسية والسمات السريعة
  const [keySpecs, setKeySpecs] = useState<SpecItem[]>([]);

  // النسخ (الذاكرة، الرام، السعر)
  const [variants, setVariants] = useState([
    { storage: '128GB', ram: '8GB', price: '', compareAtPrice: '' },
  ]);

  // الألوان
  const [colors, setColors] = useState(['أسود']);

  // الصور المرفوعة مخصصة للألوان
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);

  // جلب الأقسام عند تحميل الصفحة
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await databases.listDocuments(DATABASE_ID, 'categories');
        setCategories(res.documents);
        if (res.documents.length > 0) {
          const firstId = res.documents[0].$id;
          setCategoryId(firstId);

          // تهيئة المواصفات المقترحة لأول قسم
          const firstCat = res.documents[0];
          const slug = (firstCat.slug || '').toLowerCase();
          let templateKey = 'smartphones';
          if (slug.includes('tablet')) templateKey = 'tablets';
          else if (slug.includes('network')) templateKey = 'networks';
          else if (slug.includes('access')) templateKey = 'accessories';
          
          if (SPEC_TEMPLATES[templateKey]) {
            setKeySpecs(SPEC_TEMPLATES[templateKey].items.map((i) => ({ label: i.label, value: '' })));
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // دالة ضغط الصورة قبل رفعها
  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
      };
    });
  }

  // إدارة الصور
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressedFile = await compressImage(files[i]);
      newItems.push({
        id: Math.random().toString(36).substring(7),
        file: compressedFile,
        previewUrl: URL.createObjectURL(compressedFile),
        colorName: colors[0] || '',
      });
    }

    setImageItems((prev) => [...prev, ...newItems]);
  };

  const removeImageItem = (id: string) => {
    setImageItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateImageColor = (id: string, colorName: string) => {
    setImageItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, colorName } : item))
    );
  };

  // إدارة النسخ
  const addVariant = () => {
    setVariants([...variants, { storage: '256GB', ram: '8GB', price: '', compareAtPrice: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // إدارة الألوان
  const addColor = () => setColors([...colors, '']);
  const removeColor = (index: number) => {
    const colorToRemove = colors[index];
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    if (colorToRemove) {
      setImageItems((prev) =>
        prev.map((item) => (item.colorName === colorToRemove ? { ...item, colorName: '' } : item))
      );
    }
  };

  // حفظ المنتج بالكامل عبر API Route
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('الرجاء إدخال اسم المنتج على الأقل.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('isActive', String(isActive));
      formData.append('isFeatured', String(isFeatured));
      formData.append('isOffer', String(isOffer));
      formData.append('condition', condition);
      formData.append('conditionLabel', conditionLabel);
      if (compareAtPrice) formData.append('compareAtPrice', compareAtPrice);

      formData.append('variants', JSON.stringify(variants));
      formData.append('colors', JSON.stringify(colors.filter((c) => c.trim())));

      const imageColorsList: string[] = [];
      imageItems.forEach((item) => {
        formData.append('images', item.file);
        imageColorsList.push(item.colorName || '');
      });
      formData.append('imageColors', JSON.stringify(imageColorsList));

      const validKeySpecs = keySpecs.filter((s) => s.label.trim() && s.value.trim());
      formData.append('keySpecs', JSON.stringify(validKeySpecs));

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء حفظ المنتج');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(`حدث خطأ أثناء الحفظ: ${err.message || 'تأكد من البيانات المدخلة'}`);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لإدارة المنتجات</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">إضافة منتج جديد</h1>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* نموذج إضافة المنتج */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. المعلومات الأساسية */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Tag className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-black text-gray-900">المعلومات الأساسية</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700">اسم المنتج *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: آيفون 16 برو ماكس / راوتر هواوي 5G"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">القسم / التصنيف</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">بدون قسم</option>
                {categories.map((cat) => (
                  <option key={cat.$id} value={cat.$id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">حالة المنتج في المتجر</label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="true">نشط (معروض ومتاح للطلب)</option>
                <option value="false">مخفي (مسودة غير معروضة)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">السعر قبل الخصم (ر.س) - اختياري</label>
              <input
                type="number"
                step="any"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="مثال: 3200 (لإظهار سعر الخصم مشطوباً)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* تمييز المنتج في الصفحة الرئيسية والعروض */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="newIsFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="newIsFeatured" className="text-xs space-y-0.5 cursor-pointer">
                  <span className="font-black text-gray-900 block">تمييز في تبويب "الأكثر طلباً"</span>
                  <span className="text-gray-500 block">يظهر المنتج في التبويب الأول بالصفحة الرئيسية.</span>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="newIsOffer"
                  checked={isOffer}
                  onChange={(e) => setIsOffer(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="newIsOffer" className="text-xs space-y-0.5 cursor-pointer">
                  <span className="font-black text-gray-900 block">إدراج في "قسم وصفحة العروض" 🔥</span>
                  <span className="text-gray-500 block">يظهر المنتج في تبويب العروض بالرئيسية وصفحة /offers.</span>
                </label>
              </div>
            </div>

            {/* حالة المنتج: جديد أم مستخدم مع تخصيص المسمى */}
            <div className="sm:col-span-2 p-5 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl border border-gray-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">حالة المنتج (جديد / مستخدم)</h3>
                  <p className="text-xs text-gray-500">اختر نوع الحالة الأساسي وخصص التسمية التي ستظهر للعميل في المتجر</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                  condition === 'new' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {conditionLabel || (condition === 'new' ? 'جديد' : 'مستخدم')}
                </span>
              </div>

              {/* أزرار اختيار الحالة الأساسية */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCondition('new');
                    if (!conditionLabel || conditionLabel.includes('مستخدم')) {
                      setConditionLabel('جديد');
                    }
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${
                    condition === 'new'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <span>✨ منتج جديد (New)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCondition('used');
                    if (!conditionLabel || conditionLabel === 'جديد' || conditionLabel.includes('جديد')) {
                      setConditionLabel('مستخدم أمريكي');
                    }
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${
                    condition === 'used'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <span>🔄 منتج مستخدم (Used)</span>
                </button>
              </div>

              {/* مقترحات وتخصيص نص الحالة */}
              <div className="space-y-2 pt-2 border-t border-gray-200/60">
                <label className="text-xs font-bold text-gray-700 block">
                  نص الحالة المعروض للعميل:
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(condition === 'new'
                    ? ['جديد', 'جديد وكالة', 'جديد بالكرتون', 'جديد متبرشم']
                    : ['مستخدم أمريكي', 'مستخدم محلي', 'مستخدم كرت نظيف', 'مستخدم بحالة الوكالة', 'مجدد (Refurbished)']
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setConditionLabel(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        conditionLabel === preset
                          ? 'bg-purple-900 text-white border-purple-900 font-bold'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={conditionLabel}
                  onChange={(e) => setConditionLabel(e.target.value)}
                  placeholder="أو اكتب مسمى مخصص هنا..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700">الوصف والمواصفات</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب المواصفات والضمان والمميزات بالتفصيل..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 2. المواصفات الأساسية والسمات السريعة للمنتج حسب القسم */}
        <KeySpecsEditor
          categoryId={categoryId}
          categories={categories}
          specs={keySpecs}
          onChange={setKeySpecs}
        />

        {/* 3. الألوان المميزة للمنتج */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-black text-gray-900">الألوان المتاحة</h2>
            </div>
            <button
              type="button"
              onClick={addColor}
              className="text-xs font-bold text-primary-600 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة لون</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...colors];
                    newColors[index] = e.target.value;
                    setColors(newColors);
                  }}
                  placeholder="اسم اللون (مثال: تيتانيوم أسود، أزرق غامق)"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. الصور وتخصيص كل صورة للون محدد */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-600" />
              <div>
                <h2 className="text-lg font-black text-gray-900">صور المنتج وزوايا الألوان</h2>
                <p className="text-xs text-gray-500">
                  يمكنك ربط كل صورة بلون معين ليظهر تلقائياً للعملاء
                </p>
              </div>
            </div>
          </div>

          {/* منطقة إضافة صور جديدة */}
          <div className="border-2 border-dashed border-gray-200 hover:border-primary-400 bg-gray-50/50 hover:bg-purple-50/20 rounded-2xl p-6 text-center transition cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-2 pointer-events-none">
              <ImageIcon className="w-8 h-8 text-primary-400 mx-auto" />
              <div className="text-sm font-bold text-gray-800">
                اضغط هنا أو اسحب الصور لرفعها
              </div>
              <div className="text-xs text-gray-400">تدعم PNG, JPG, WEBP وسيقوم النظام بضغطها لتسريع التحميل</div>
            </div>
          </div>

          {/* قائمة الصور المرفوعة */}
          {imageItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {imageItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-3"
                >
                  <div className="relative w-full h-40 bg-white rounded-xl overflow-hidden border border-gray-100">
                    <Image
                      src={item.previewUrl}
                      alt={`معاينة ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-2"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        الصورة الرئيسية
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">خاصة باللون:</label>
                    <select
                      value={item.colorName}
                      onChange={(e) => updateImageColor(item.id, e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">جميع الألوان (عامة)</option>
                      {colors
                        .filter((c) => c.trim() !== '')
                        .map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImageItem(item.id)}
                    className="w-full py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الصورة</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. النسخ والأسعار */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-black text-gray-900">
                نسخ المنتج (الذاكرة، الرام والسعر)
              </h2>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs font-bold text-primary-600 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة خيار / سعة</span>
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
              >
                <div>
                  <label className="text-xs font-bold text-gray-600">التخزين (الذاكرة)</label>
                  <input
                    type="text"
                    value={variant.storage}
                    onChange={(e) => {
                      const newV = [...variants];
                      newV[index].storage = e.target.value;
                      setVariants(newV);
                    }}
                    placeholder="256GB"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600">الرام (RAM)</label>
                  <input
                    type="text"
                    value={variant.ram}
                    onChange={(e) => {
                      const newV = [...variants];
                      newV[index].ram = e.target.value;
                      setVariants(newV);
                    }}
                    placeholder="8GB"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-full">
                    <label className="text-xs font-bold text-gray-600">السعر (ر.س - ريال سعودي) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={variant.price}
                      onChange={(e) => {
                        const newV = [...variants];
                        newV[index].price = e.target.value;
                        setVariants(newV);
                      }}
                      placeholder="2500"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition mb-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* زر الحفظ والنشر */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl flex items-center gap-3 transition shadow-md disabled:opacity-50 text-base cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري حفظ ورفع المنتج...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>حفظ ونشر المنتج</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}