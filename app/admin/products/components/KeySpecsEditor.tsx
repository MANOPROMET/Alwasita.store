'use client';

import React from 'react';
import { PlusCircle, Trash2, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { Category } from '@/types';

export interface SpecItem {
  label: string;
  value: string;
}

interface KeySpecsEditorProps {
  categoryId: string;
  categories: Category[];
  specs: SpecItem[];
  onChange: (newSpecs: SpecItem[]) => void;
}

export const SPEC_TEMPLATES: Record<
  string,
  { title: string; icon: string; items: { label: string; placeholder: string }[] }
> = {
  smartphones: {
    title: 'هواتف ذكية',
    icon: '📱',
    items: [
      { label: 'نوع المعالج', placeholder: 'مثال: Snapdragon 8 Gen 3 أو Apple A18' },
      { label: 'الذاكرة والرام', placeholder: 'مثال: 256GB / 12GB RAM' },
      { label: 'الكاميرا', placeholder: 'مثال: 200MP رئيسية + 50MP تقريب بصري' },
      { label: 'الألوان المتوفرة', placeholder: 'مثال: تيتانيوم أسود، رمادي، بنفسجي' },
      { label: 'الشاشة', placeholder: 'مثال: 6.8 بوصة AMOLED 120Hz' },
      { label: 'البطارية والشحن', placeholder: 'مثال: 5000mAh شحن سريع 45W' },
    ],
  },
  tablets: {
    title: 'أجهزة لوحية',
    icon: '💻',
    items: [
      { label: 'نوع المعالج', placeholder: 'مثال: Apple M2 أو Snapdragon 8 Gen 2' },
      { label: 'مقاس الشاشة', placeholder: 'مثال: 11 بوصة Liquid Retina عالية الدقة' },
      { label: 'الذاكرة والرام', placeholder: 'مثال: 128GB / 8GB RAM' },
      { label: 'دعم القلم والكيبورد', placeholder: 'مثال: يدعم القلم الضوئي ولوحة المفاتيح الذكية' },
      { label: 'البطارية', placeholder: 'مثال: 8000mAh تدوم حتى 10 ساعات' },
    ],
  },
  networks: {
    title: 'أجهزة الشبكات',
    icon: '🌐',
    items: [
      { label: 'نوع وسرعة الشبكة', placeholder: 'مثال: 5G / 4G LTE بسرعة تصل 300Mbps' },
      { label: 'الترددات ونطاق الواي فاي', placeholder: 'مثال: Dual-Band 2.4GHz & 5GHz (Wi-Fi 6)' },
      { label: 'المنافذ والهوائيات', placeholder: 'مثال: 4 منافذ Gigabit LAN + 4 هوائيات قوية' },
      { label: 'عدد الأجهزة المتصلة', placeholder: 'مثال: يدعم حتى 64 جهاز في آن واحد' },
    ],
  },
  accessories: {
    title: 'شواحن وملحقات',
    icon: '🔋',
    items: [
      { label: 'قدرة وسرعة الشحن', placeholder: 'مثال: 65W GaN شحن فائق السرعة' },
      { label: 'المنافذ والوصلات', placeholder: 'مثال: 2x Type-C + 1x USB-A' },
      { label: 'سعة البطارية', placeholder: 'مثال: 20,000mAh (لبنوك الطاقة)' },
      { label: 'التوافق والأمان', placeholder: 'مثال: متوافق مع كافة الهواتف مع حماية ذكية' },
    ],
  },
};

export default function KeySpecsEditor({
  categoryId,
  categories,
  specs,
  onChange,
}: KeySpecsEditorProps) {
  // تحديد القالب المناسب حسب القسم الحالي
  const currentCategory = categories.find((c) => c.$id === categoryId);
  const currentSlug = (currentCategory?.slug || '').toLowerCase();

  const handleSpecChange = (index: number, field: 'label' | 'value', text: string) => {
    const updated = [...specs];
    updated[index] = { ...updated[index], [field]: text };
    onChange(updated);
  };

  const addCustomSpec = () => {
    onChange([...specs, { label: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  const applyTemplate = (templateKey: string) => {
    const template = SPEC_TEMPLATES[templateKey];
    if (!template) return;

    // دمج الخصائص غير الموجودة أو استبدالها بخصائص القالب
    const newItems = template.items.map((item) => {
      const existing = specs.find((s) => s.label.trim() === item.label.trim());
      return {
        label: item.label,
        value: existing ? existing.value : '',
      };
    });

    // الحفاظ على أي خصائص مخصصة أضافها المستخدم سابقاً
    const customExisting = specs.filter(
      (s) => !template.items.some((ti) => ti.label.trim() === s.label.trim()) && s.value.trim()
    );

    onChange([...newItems, ...customExisting]);
  };

  const clearAllSpecs = () => {
    onChange([]);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
      {/* رأس الصندوق */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-gray-900">
              المواصفات الأساسية والسمات السريعة
            </h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            تظهر كبطاقات بارزة وأنيقة للمشتري قبل التفاصيل الكاملة.
            <span className="text-blue-600 font-bold mr-1">
              جميع الحقول اختيارية، وأي سمة تتركها فارغة لن تظهر إطلاقاً في صفحة المنتج.
            </span>
          </p>
        </div>

        {/* أزرار سريعة لتطبيق قوالب الأقسام */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {Object.entries(SPEC_TEMPLATES).map(([key, t]) => {
            const isMatch = currentSlug.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isMatch
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={`تطبيق مواصفات مقترحة لقسم ${t.title}`}
              >
                <span>{t.icon}</span>
                <span>{t.title}</span>
              </button>
            );
          })}

          {specs.length > 0 && (
            <button
              type="button"
              onClick={clearAllSpecs}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="تفريغ الحقول"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* قائمة المواصفات */}
      <div className="space-y-3">
        {specs.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-3">
            <Layers className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500">
              لم تتم إضافة أي مواصفات أساسية بعد. يمكنك اختيار قالب أعلاه أو البدء بإضافة خاصية مخصصة.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (currentSlug.includes('tablet')) applyTemplate('tablets');
                  else if (currentSlug.includes('network')) applyTemplate('networks');
                  else if (currentSlug.includes('access')) applyTemplate('accessories');
                  else applyTemplate('smartphones');
                }}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                تطبيق المواصفات المقترحة للقسم
              </button>
              <button
                type="button"
                onClick={addCustomSpec}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                + إضافة خاصية مخصصة
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {specs.map((spec, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-2xl bg-gray-50/70 border border-gray-200/70 hover:border-blue-200 hover:bg-white transition"
              >
                {/* 1. عنوان الخاصية (بخط هافت ومناسب) */}
                <div className="sm:w-1/3">
                  <div className="relative">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                      placeholder="عنوان الخاصية (مثال: نوع المعالج / دعم القلم)"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 2. القيمة / السمة (بخط بارز) */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="السمة / القيمة (مثال: Snapdragon 8 Gen 3 أو يدعم القلم الضوئي)"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 3. زر حذف الخاصية */}
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="self-end sm:self-center p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
                  title="حذف هذه الخاصية"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* زر إضافة خاصية مخصصة جديدة */}
      <div className="pt-1 flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={addCustomSpec}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة خاصية مخصصة جديدة</span>
        </button>

        <span className="text-[11px] text-gray-400">
          💡 يمكنك كتابة أي خاصية بحرية مثل: &quot;دعم القلم&quot;، &quot;نوع الشاشة&quot;، &quot;سرعة الشبكة&quot;، إلخ.
        </span>
      </div>
    </div>
  );
}
