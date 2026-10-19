'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Tag,
  Hash,
  ArrowUpDown,
  Smartphone,
  Tablet,
  Wifi,
  Headphones,
} from 'lucide-react';

interface CategoryItem {
  $id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // نموذج إضافة قسم جديد
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSortOrder, setNewSortOrder] = useState<number>(1);
  const [newIsActive, setNewIsActive] = useState(true);

  // تحميل الأقسام
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        setNewSortOrder(data.categories.length + 1);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setErrorMsg('تعذر تحميل الأقسام من قاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // إضافة قسم جديد
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('اسم القسم مطلوب');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug: newSlug || undefined,
          sortOrder: newSortOrder,
          isActive: newIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشلت إضافة القسم');
      }

      setSuccessMsg(`تمت إضافة قسم "${newName}" بنجاح!`);
      setNewName('');
      setNewSlug('');
      setShowAddModal(false);
      await loadCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إضافة القسم');
    } finally {
      setActionLoading(false);
    }
  };

  // تبديل حالة التنشيط
  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.$id,
          isActive: !cat.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تحديث حالة القسم');
    } finally {
      setActionLoading(false);
    }
  };

  // حذف قسم
  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${cat.name}"؟`)) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/categories?id=${cat.$id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg(`تم حذف قسم "${cat.name}" بنجاح`);
      await loadCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حذف القسم');
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryIcon = (slug: string, name: string) => {
    const s = (slug + ' ' + name).toLowerCase();
    if (s.includes('phone') || s.includes('هاتف')) return <Smartphone className="w-5 h-5 text-primary-600" />;
    if (s.includes('tablet') || s.includes('لوحي')) return <Tablet className="w-5 h-5 text-blue-600" />;
    if (s.includes('net') || s.includes('شبك') || s.includes('راوتر')) return <Wifi className="w-5 h-5 text-emerald-600" />;
    return <Headphones className="w-5 h-5 text-amber-600" />;
  };

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
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            الأقسام والتصنيفات
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            إدارة فئات المتجر، ترتيبها، وتفعيل ظهورها في الصفحة الرئيسية وفلاتر المنتجات.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-xs sm:text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* رسائل التنبيه */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-700">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs sm:text-sm font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* بطاقة نموذج الإضافة السريع */}
      {showAddModal && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-primary-500/50 shadow-md space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-primary-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-gray-900">إضافة تصنيف / قسم جديد</h2>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
            >
              إلغاء ✕
            </button>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">اسم القسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .trim()
                          .toLowerCase()
                          .replace(/[\s_]+/g, '-')
                      );
                    }
                  }}
                  placeholder="مثال: الساعات الذكية / أجهزة الصوتيات"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">المعرف اللطيف (Slug)</label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="smart-watches"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">ترتيب الظهور</label>
                <input
                  type="number"
                  value={newSortOrder}
                  onChange={(e) => setNewSortOrder(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">الحالة</label>
                <select
                  value={newIsActive ? 'true' : 'false'}
                  onChange={(e) => setNewIsActive(e.target.value === 'true')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="true">نشط (يظهر في الواجهة فوراً)</option>
                  <option value="false">معطل مؤقتاً</option>
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>حفظ القسم وإضافته</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* جدول الأقسام الحالية */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="text-xs font-bold text-gray-500">جاري جلب الأقسام من قاعدة البيانات...</span>
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/70 text-xs font-black text-gray-500 uppercase">
                  <th className="py-4 px-6">القسم / التصنيف</th>
                  <th className="py-4 px-6">المعرّف (Slug)</th>
                  <th className="py-4 px-6 text-center">الترتيب</th>
                  <th className="py-4 px-6 text-center">المنتجات المرتبطة</th>
                  <th className="py-4 px-6 text-center">الحالة</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {categories.map((cat) => (
                  <tr key={cat.$id} className="hover:bg-purple-50/15 transition">
                    
                    {/* اسم القسم والأيقونة */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                        {getCategoryIcon(cat.slug, cat.name)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{cat.name}</div>
                        <div className="text-[11px] font-mono text-gray-400 mt-0.5">ID: {cat.$id}</div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md">
                        {cat.slug}
                      </span>
                    </td>

                    {/* الترتيب */}
                    <td className="py-4 px-6 text-center font-bold text-gray-700">
                      {cat.sortOrder}
                    </td>

                    {/* عدد المنتجات */}
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/admin/products?category=${cat.$id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-primary-700 hover:bg-primary-600 hover:text-white transition"
                        title="عرض منتجات هذا القسم"
                      >
                        <span>{cat.productCount ?? 0} منتج</span>
                      </Link>
                    </td>

                    {/* الحالة */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="اضغط لتبديل حالة التنشيط"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <span>{cat.isActive ? 'نشط ومعروض' : 'موقف'}</span>
                      </button>
                    </td>

                    {/* الإجراءات */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                          title="حذف القسم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <Layers className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">لا توجد أقسام مسجلة</h3>
            <p className="text-xs text-gray-500">اضغط على زر إضافة قسم لإنشاء أقسام وتصنيفات المتجر.</p>
          </div>
        )}
      </div>

    </div>
  );
}
