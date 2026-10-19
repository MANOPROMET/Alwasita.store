'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Tag,
  Palette,
  Layers,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { getProductImageUrl } from '@/lib/appwrite/utils';
import { Category, Product } from '@/types';

interface EditProductFormProps {
  initialProduct: Product;
  categories: Category[];
}

export default function EditProductForm({
  initialProduct,
  categories,
}: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // استخراج فئة المنتج
  const rawCat = (initialProduct as any).category || (initialProduct as any).categories;
  const currentCatId = typeof rawCat === 'string' ? rawCat : rawCat?.$id || '';

  const [name, setName] = useState(initialProduct.name || '');
  const [description, setDescription] = useState(initialProduct.description || '');
  const [categoryId, setCategoryId] = useState(currentCatId);
  const [isActive, setIsActive] = useState(initialProduct.isActive !== false);
  const [isFeatured, setIsFeatured] = useState(Boolean(initialProduct.isFeatured));
  const [isOffer, setIsOffer] = useState(Boolean(initialProduct.isOffer));
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct.compareAtPrice ? String(initialProduct.compareAtPrice) : ''
  );
  const [condition, setCondition] = useState<'new' | 'used'>(
    (initialProduct.condition as 'new' | 'used') || 'new'
  );
  const [conditionLabel, setConditionLabel] = useState(
    initialProduct.conditionLabel || (initialProduct.condition === 'used' ? 'مستخدم' : 'جديد')
  );

  // النسخ والأسعار
  const initialVariants =
    initialProduct.variants && initialProduct.variants.length > 0
      ? initialProduct.variants.map((v) => ({
          storage: v.memory || '',
          ram: v.ram || '',
          price: String(v.price || ''),
        }))
      : [{ storage: '128GB', ram: '8GB', price: String(initialProduct.price || '') }];

  const [variants, setVariants] = useState(initialVariants);

  // الألوان
  const initialColors =
    initialProduct.colors && initialProduct.colors.length > 0
      ? initialProduct.colors.map((c) => c.name)
      : ['افتراضي'];

  const [colors, setColors] = useState(initialColors);

  // الصور الحالية
  const existingImages = initialProduct.images || [];

  // صور جديدة للرفع
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    setNewImageFiles((prev) => [...prev, ...filesArray]);

    const previews = filesArray.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // إدارة النسخ
  const addVariant = () => {
    setVariants([...variants, { storage: '256GB', ram: '8GB', price: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // إدارة الألوان
  const addColor = () => setColors([...colors, '']);
  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('اسم المنتج مطلوب.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('id', initialProduct.$id);
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

      // إضافة الصور الجديدة
      newImageFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('imageColors', JSON.stringify(newImageFiles.map(() => '')));

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء تعديل المنتج');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      console.error('Error updating product:', err);
      setErrorMsg(`حدث خطأ: ${err.message || 'تعذر التحديث'}`);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* رسالة الخطأ */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

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
            <label className="text-xs font-bold text-gray-700">حالة العرض</label>
            <select
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="true">نشط ومعروض للعملاء</option>
              <option value="false">مخفي عن العرض</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">السعر قبل الخصم (ر.س) - اختياري</label>
            <input
              type="number"
              step="any"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="مثال: 3200"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* تبويبات التمييز في الأكثر طلباً والعروض */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="editIsFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="editIsFeatured" className="text-xs space-y-0.5 cursor-pointer">
                <span className="font-black text-gray-900 block">تمييز في تبويب "الأكثر طلباً"</span>
                <span className="text-gray-500 block">يظهر المنتج في التبويب الأول بالصفحة الرئيسية.</span>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="editIsOffer"
                checked={isOffer}
                onChange={(e) => setIsOffer(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="editIsOffer" className="text-xs space-y-0.5 cursor-pointer">
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
            <label className="text-xs font-bold text-gray-700">الوصف الشامل للمنتج</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. الألوان */}
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

      {/* 3. الصور */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <ImageIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-black text-gray-900">الصور الحالية وإضافة صور جديدة</h2>
        </div>

        {/* الصور المسجلة حالياً */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-600">الصور الحالية في قاعدة البيانات:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {existingImages.map((img, i) => {
                const url = getProductImageUrl(img.fileId);
                return (
                  <div
                    key={img.$id || i}
                    className="relative h-32 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-2"
                  >
                    <Image
                      src={url}
                      alt={initialProduct.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* إضافة صور إضافية */}
        <div className="border-2 border-dashed border-gray-200 hover:border-primary-400 bg-gray-50/50 hover:bg-purple-50/20 rounded-2xl p-6 text-center transition cursor-pointer relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="space-y-1.5 pointer-events-none">
            <ImageIcon className="w-7 h-7 text-primary-500 mx-auto" />
            <div className="text-sm font-bold text-gray-800">
              اضغط لرفع صور إضافية للمنتج
            </div>
          </div>
        </div>

        {/* معاينة الصور الجديدة المرفوعة */}
        {newImagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {newImagePreviews.map((preview, i) => (
              <div
                key={i}
                className="relative h-32 rounded-2xl border border-primary-200 bg-white overflow-hidden p-2 group"
              >
                <Image src={preview} alt="معاينة جديدة" fill className="object-contain p-2" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-2 left-2 p-1.5 bg-red-600 text-white rounded-lg text-xs opacity-90 hover:opacity-100 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
              خيارات المنتج والأسعار (Variants)
            </h2>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="text-xs font-bold text-primary-600 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة خيار</span>
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
            >
              <div>
                <label className="text-xs font-bold text-gray-600">الذاكرة / السعة</label>
                <input
                  type="text"
                  value={variant.storage}
                  onChange={(e) => {
                    const newV = [...variants];
                    newV[index].storage = e.target.value;
                    setVariants(newV);
                  }}
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

      {/* زر الحفظ */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl flex items-center gap-3 transition shadow-md disabled:opacity-50 text-base cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري حفظ التعديلات...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>حفظ التعديلات للمنتج</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
