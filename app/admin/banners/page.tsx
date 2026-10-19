'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Eye,
  Sliders,
  Tag,
  ShoppingBag,
  Sparkles,
  Layers,
  Save,
  RefreshCw,
  Edit,
} from 'lucide-react';
import { getProductImageUrl } from '@/lib/appwrite/utils';
import { Product } from '@/types';

interface BannerItem {
  $id: string;
  title: string;
  subtitle?: string;
  bannerType?: 'hero' | 'promo';
  productId?: string;
  imageFileId: string;
  linkType: string;
  linkValue?: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'promo'>('hero');
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // نموذج إضافة شريحة للبنر الرئيسي
  const [showAddForm, setShowAddForm] = useState(false);
  const [slideType, setSlideType] = useState<'custom' | 'product'>('custom');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkValue, setLinkValue] = useState('/products');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // حالة تعديل شريحة موجودة
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [editSlideType, setEditSlideType] = useState<'custom' | 'product'>('custom');
  const [editSelectedProductId, setEditSelectedProductId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editLinkValue, setEditLinkValue] = useState('/products');
  const [editSortOrder, setEditSortOrder] = useState(1);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  // حالة البنر الثابت (Promo Banner)
  const [promoBanner, setPromoBanner] = useState<BannerItem | null>(null);
  const [promoBadge, setPromoBadge] = useState('خصومات حصرية');
  const [promoTitle, setPromoTitle] = useState('صفقات وتخفيضات اليوم');
  const [promoDesc, setPromoDesc] = useState('تصفح المنتجات المخفضة لفترة محدودة');
  const [promoLink, setPromoLink] = useState('/offers');
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [promoImageFile, setPromoImageFile] = useState<File | null>(null);
  const [promoImagePreview, setPromoImagePreview] = useState<string>('');

  // جلب البنرات والمنتجات
  const loadData = async () => {
    try {
      setLoading(true);
      const [bannersRes, productsRes] = await Promise.all([
        fetch('/api/admin/banners'),
        fetch('/api/admin/products'),
      ]);

      const bannersData = await bannersRes.json();
      const productsData = await productsRes.json();

      if (bannersData.success && bannersData.banners) {
        setBanners(bannersData.banners);

        // استخراج البنر الثابت
        const promo = bannersData.banners.find((b: BannerItem) => b.bannerType === 'promo');
        if (promo) {
          setPromoBanner(promo);
          setPromoTitle(promo.title || 'صفقات وتخفيضات اليوم');
          setPromoLink(promo.linkValue || '/offers');
          setPromoIsActive(promo.isActive !== false);

          if (promo.subtitle && promo.subtitle.includes('|')) {
            const parts = promo.subtitle.split('|');
            setPromoBadge(parts[0]?.trim() || 'خصومات حصرية');
            setPromoDesc(parts[1]?.trim() || 'تصفح المنتجات المخفضة لفترة محدودة');
          } else if (promo.subtitle) {
            setPromoDesc(promo.subtitle);
          }

          if (promo.imageFileId) {
            setPromoImagePreview(getProductImageUrl(promo.imageFileId));
          }
        }
      }

      if (productsData.success && productsData.products) {
        setProducts(productsData.products);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // عند اختيار منتج للربط بالبنر الرئيسي
  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find((p) => p.$id === pId);
    if (prod) {
      setTitle(prod.name);
      setLinkValue(`/products/${prod.$id}`);

      // حساب أقل سعر من نسخ المنتج بدقة
      let minPrice = Number(prod.price) || 0;
      if (prod.variants && prod.variants.length > 0) {
        const prices = prod.variants
          .map((v) => Number(v.price) || 0)
          .filter((pr) => pr > 0);
        if (prices.length > 0) {
          minPrice = Math.min(...prices);
        }
      }

      setSubtitle(minPrice > 0 ? `${minPrice.toLocaleString('ar-SA')} ر.س` : '');

      // صورة المنتج الافتراضية
      const rawImage = prod.images?.[0] as any;
      const fileId = rawImage?.fileId || prod.mainImageFileId || '';
      if (fileId && !imageFile) {
        setImagePreview(getProductImageUrl(fileId));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePromoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPromoImageFile(file);
      setPromoImagePreview(URL.createObjectURL(file));
    }
  };

  // فتح نافذة تعديل شريحة البنر
  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setEditTitle(banner.title);
    setEditSubtitle(banner.subtitle || '');
    const isProd = banner.linkType === 'product' || Boolean(banner.productId);
    setEditSlideType(isProd ? 'product' : 'custom');
    setEditSelectedProductId(banner.productId || '');
    setEditLinkValue(banner.linkValue || (banner.productId ? `/products/${banner.productId}` : '/products'));
    setEditSortOrder(banner.sortOrder || 1);
    setEditIsActive(banner.isActive !== false);
    setEditImageFile(null);
    setEditImagePreview(getProductImageUrl(banner.imageFileId));
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductSelectForEdit = (pId: string) => {
    setEditSelectedProductId(pId);
    const prod = products.find((p) => p.$id === pId);
    if (prod) {
      setEditTitle(prod.name);
      setEditLinkValue(`/products/${prod.$id}`);

      let minPrice = Number(prod.price) || 0;
      if (prod.variants && prod.variants.length > 0) {
        const prices = prod.variants
          .map((v) => Number(v.price) || 0)
          .filter((pr) => pr > 0);
        if (prices.length > 0) minPrice = Math.min(...prices);
      }
      setEditSubtitle(`يبدأ من ${minPrice.toLocaleString('ar-SA')} ر.س`);

      const rawImage = prod.images?.[0] as any;
      const fileId = rawImage?.fileId || prod.mainImageFileId || '';
      if (fileId && !editImageFile) {
        setEditImagePreview(getProductImageUrl(fileId));
      }
    }
  };

  // حفظ تعديلات شريحة البنر
  const handleUpdateHeroBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    if (!editTitle.trim()) {
      setErrorMsg('عنوان البنر مطلوب');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('id', editingBanner.$id);
      formData.append('title', editTitle.trim());
      formData.append('subtitle', editSubtitle.trim());
      formData.append('bannerType', 'hero');
      formData.append('productId', editSlideType === 'product' ? editSelectedProductId : '');
      formData.append('linkType', editSlideType === 'product' ? 'product' : 'url');
      formData.append('linkValue', editLinkValue.trim());
      formData.append('sortOrder', String(editSortOrder));
      formData.append('isActive', String(editIsActive));

      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('تم تعديل شريحة البنر بنجاح!');
      setEditingBanner(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تعديل البنر');
    } finally {
      setActionLoading(false);
    }
  };

  // إنشاء شريحة للبنر الرئيسي
  const handleCreateHeroBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('عنوان البنر مطلوب');
      return;
    }

    let fileToUpload = imageFile;
    let fallbackImageFileId = '';

    if (slideType === 'product' && selectedProductId) {
      const prod = products.find((p) => p.$id === selectedProductId);
      const rawImage = prod?.images?.[0] as any;
      fallbackImageFileId = rawImage?.fileId || prod?.mainImageFileId || '';
    }

    if (!fileToUpload && !fallbackImageFileId) {
      setErrorMsg('يرجى اختيار أو رفع صورة للبنر');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('bannerType', 'hero');
      formData.append('productId', slideType === 'product' ? selectedProductId : '');
      formData.append('linkType', slideType === 'product' ? 'product' : 'url');
      formData.append('linkValue', linkValue.trim());
      formData.append('sortOrder', String(sortOrder));
      formData.append('isActive', String(isActive));

      if (fileToUpload) {
        formData.append('image', fileToUpload);
      } else if (fallbackImageFileId) {
        formData.append('imageFileId', fallbackImageFileId);
      }

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('تمت إضافة شريحة البنر الرئيسي بنجاح!');
      setTitle('');
      setSubtitle('');
      setImageFile(null);
      setImagePreview('');
      setSelectedProductId('');
      setShowAddForm(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إضافة البنر');
    } finally {
      setActionLoading(false);
    }
  };

  // حفظ تعديلات البنر الثابت
  const handleSavePromoBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const combinedSubtitle = `${promoBadge.trim()} | ${promoDesc.trim()}`;
      const formData = new FormData();
      formData.append('title', promoTitle.trim());
      formData.append('subtitle', combinedSubtitle);
      formData.append('bannerType', 'promo');
      formData.append('linkType', 'url');
      formData.append('linkValue', promoLink.trim());
      formData.append('sortOrder', '1');
      formData.append('isActive', String(promoIsActive));

      if (promoImageFile) {
        formData.append('image', promoImageFile);
      }

      let res;
      if (promoBanner?.$id) {
        formData.append('id', promoBanner.$id);
        res = await fetch('/api/admin/banners', {
          method: 'PUT',
          body: formData,
        });
      } else {
        if (!promoImageFile) {
          formData.append('imageFileId', 'OffersP.jpeg');
        }
        res = await fetch('/api/admin/banners', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('تم حفظ وتحديث إعدادات البنر الثابت بنجاح!');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ البنر الثابت');
    } finally {
      setActionLoading(false);
    }
  };

  // تبديل حالة التفعيل
  const handleToggleActive = async (banner: BannerItem) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.$id,
          isActive: !banner.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تحديث حالة البنر');
    } finally {
      setActionLoading(false);
    }
  };

  // حذف بنر
  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البنر؟')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حذف البنر');
    } finally {
      setActionLoading(false);
    }
  };

  const heroBanners = banners.filter((b) => b.bannerType !== 'promo');

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
            إدارة البنرات والإعلانات
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            التحكم بشرائح السلايدر التفاعلي والبنر الترويجي الثابت في الصفحة الرئيسية.
          </p>
        </div>

        {activeTab === 'hero' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة شريحة بنر رئيسي</span>
          </button>
        )}
      </div>

      {/* التنبيهات */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs sm:text-sm font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500">✕</button>
        </div>
      )}

      {/* تبويبات التنقل بين أقسام البنرات */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>شرائح البنر الرئيسي (السلايدر)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20">
            {heroBanners.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promo')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer ${
            activeTab === 'promo'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>البنر الثابت (عروض وتخفيضات)</span>
          {promoBanner?.isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* ===================== 1. قسم البنر الرئيسي (Hero Slider) ===================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">

          {/* نموذج إضافة شريحة بنر رئيسي */}
          {showAddForm && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-primary-500/50 shadow-md space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">إضافة شريحة للبنر الرئيسي</h2>
                  <p className="text-xs text-gray-500">اختر نوع الإعلان، إما مخصص أو مرتبط مباشرة بمنتج من المتجر.</p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
                >
                  إلغاء ✕
                </button>
              </div>

              {/* اختيار نوع الشريحة */}
              <div className="flex items-center gap-3 p-1.5 bg-gray-100 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setSlideType('custom')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    slideType === 'custom'
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  إعلان عادي مخصص
                </button>
                <button
                  type="button"
                  onClick={() => setSlideType('product')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    slideType === 'product'
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  اختيار منتج من المعروضات
                </button>
              </div>

              <form onSubmit={handleCreateHeroBanner} className="space-y-4">
                
                {/* إذا كان نوع الشريحة منتج */}
                {slideType === 'product' && (
                  <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-2">
                    <label className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-primary-600" />
                      <span>اختر المنتج من المعروضات *</span>
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      required={slideType === 'product'}
                      className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">-- اضغط لاختيار منتج من المتجر --</option>
                      {products.map((p) => {
                        let lowestPrice = Number(p.price) || 0;
                        if (p.variants && p.variants.length > 0) {
                          const prices = p.variants
                            .map((v) => Number(v.price) || 0)
                            .filter((pr) => pr > 0);
                          if (prices.length > 0) lowestPrice = Math.min(...prices);
                        }
                        return (
                          <option key={p.$id} value={p.$id}>
                            {p.name} (أقل سعر: {lowestPrice.toLocaleString('ar-SA')} ر.س)
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[11px] text-purple-700 font-medium">
                      سيتم تلقائياً جلب أقل سعر من نسخ المنتج وعرضه بالسعودي واليمني والدولار حسب مصارفة العملات.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* العنوان الرئيسي */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">النص / العنوان الرئيسي *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: ايفون 15 برو ماكس"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* النص الفرعي */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">النص الفرعي / الوصف</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="مثال: أحدث التقنيات وأقوى أداء"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* الرابط */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">رابط التوجيه عند النقر</label>
                    <input
                      type="text"
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                      placeholder="/products"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* الترتيب */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">ترتيب الظهور</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* رفع / اختيار الصورة */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    صورة البنر {slideType === 'product' ? '(اختياري - تُستخدم صورة المنتج تلقائياً إن لم ترفع صورة خاصة)' : '*'}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="w-16 h-12 relative rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        <Image
                          src={imagePreview}
                          alt="معاينة"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveHero"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveHero" className="text-xs font-bold text-gray-700 cursor-pointer">
                    تفعيل الشريحة وعرضها فورياً في السلايدر
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>إضافة الشريحة للسلايدر</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* نافذة تعديل شريحة البنر الرئيسي (Modal) */}
          {editingBanner && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary-600" />
                      <span>تعديل شريحة البنر الرئيسي</span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      يمكنك تعديل النصوص، الصورة، الرابط، أو المنتج المرتبط بالشريحة دون الحاجة لحذفها.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingBanner(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* اختيار نوع الشريحة عند التعديل */}
                <div className="flex items-center gap-3 p-1.5 bg-gray-100 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => setEditSlideType('custom')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      editSlideType === 'custom'
                        ? 'bg-white text-primary-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    إعلان عادي مخصص
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSlideType('product')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      editSlideType === 'product'
                        ? 'bg-white text-primary-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    اختيار منتج من المعروضات
                  </button>
                </div>

                <form onSubmit={handleUpdateHeroBanner} className="space-y-4">
                  {editSlideType === 'product' && (
                    <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-2">
                      <label className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-primary-600" />
                        <span>اختر المنتج من المعروضات *</span>
                      </label>
                      <select
                        value={editSelectedProductId}
                        onChange={(e) => handleProductSelectForEdit(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">-- اضغط لاختيار منتج من المتجر --</option>
                        {products.map((p) => (
                          <option key={p.$id} value={p.$id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">النص / العنوان الرئيسي *</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">النص الفرعي / الوصف</label>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">رابط التوجيه عند النقر</label>
                      <input
                        type="text"
                        value={editLinkValue}
                        onChange={(e) => setEditLinkValue(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">ترتيب الظهور</label>
                      <input
                        type="number"
                        value={editSortOrder}
                        onChange={(e) => setEditSortOrder(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* صورة البنر الحالية والجديدة */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-700 block">
                      صورة البنر (اختياري - اتركها كما هي للاحتفاظ بالصورة الحالية)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                      />
                      {editImagePreview && (
                        <div className="w-16 h-12 relative rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          <Image
                            src={editImagePreview}
                            alt="معاينة الصورة"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="editIsActiveHero"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="editIsActiveHero" className="text-xs font-bold text-gray-700 cursor-pointer">
                      تفعيل الشريحة وعرضها في السلايدر
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingBanner(null)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-4 h-4" />
                      <span>حفظ التعديلات</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* قائمة شرائح السلايدر الحالي */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <span className="text-xs font-bold text-gray-500">جاري تحميل البنرات...</span>
            </div>
          ) : heroBanners.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-primary-600 flex items-center justify-center mx-auto">
                <Sliders className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">لا توجد شرائح مضافة للبنر الرئيسي بعد</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                حالياً يتم عرض الشريحة الافتراضية مع أحدث 5 منتجات تلقائياً. يمكنك الضغط على "إضافة شريحة بنر رئيسي" للتحكم الكامل.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroBanners.map((banner) => {
                const imgUrl = getProductImageUrl(banner.imageFileId);
                const isProductLinked = banner.linkType === 'product' && banner.productId;
                const linkedProduct = products.find((p) => p.$id === banner.productId);

                return (
                  <div
                    key={banner.$id}
                    className={`bg-white rounded-3xl border transition overflow-hidden shadow-xs flex flex-col ${
                      banner.isActive
                        ? 'border-gray-200/90 hover:border-primary-400'
                        : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-black/60 text-white backdrop-blur-md border border-white/20">
                          ترتيب: {banner.sortOrder}
                        </span>
                        {isProductLinked && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-xs">
                            منتج مربوط
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 left-3 text-white space-y-0.5">
                        <h4 className="text-sm font-black truncate">{banner.title}</h4>
                        {banner.subtitle && (
                          <p className="text-xs text-purple-200 truncate">{banner.subtitle}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">الرابط:</span>
                          <span className="font-mono text-gray-700 truncate max-w-[180px]">
                            {banner.linkValue || '/products'}
                          </span>
                        </div>
                        {isProductLinked && linkedProduct && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">المنتج:</span>
                            <span className="font-bold text-primary-700 truncate max-w-[180px]">
                              {linkedProduct.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(banner)}
                          disabled={actionLoading}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            banner.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {banner.isActive ? 'نشط ومعروض' : 'معطل'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(banner)}
                            disabled={actionLoading}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition cursor-pointer"
                            title="تعديل الشريحة"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.$id)}
                            disabled={actionLoading}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            title="حذف الشريحة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ===================== 2. قسم البنر الثابت (Promo Banner) ===================== */}
      {activeTab === 'promo' && (
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-8 shadow-xs">
          
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-gray-900">تخصيص البنر الترويجي الثابت</h2>
            <p className="text-xs text-gray-500">
              هذا هو البنر الثابت المعروض في الواجهة الرئيسية أسفل السلايدر مباشرة. يمكنك تخصيص الصورة والنصوص والرابط بحرية.
            </p>
          </div>

          {/* معاينة حية للمظهر كما في الصفحة الرئيسية */}
          <div className="space-y-2">
            <span className="text-xs font-black text-gray-700 block">معاينة حية لشكل البنر:</span>
            <div className="group relative overflow-hidden rounded-3xl border border-purple-500/30 shadow-md min-h-[160px] sm:min-h-[200px] flex flex-col justify-center p-8 bg-zinc-950">
              <div className="absolute inset-0 z-0">
                <Image
                  src={promoImagePreview || '/OffersP.jpeg'}
                  alt={promoTitle}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
              </div>

              <div className="relative z-10 max-w-md space-y-2">
                <span className="text-xs font-black text-purple-300 bg-purple-500/30 px-3 py-1 rounded-full backdrop-blur-sm border border-purple-400/20 inline-block">
                  {promoBadge || 'خصومات حصرية'}
                </span>
                <h4 className="text-2xl font-black text-white">{promoTitle || 'صفقات وتخفيضات اليوم'}</h4>
                <p className="text-sm text-zinc-300">{promoDesc || 'تصفح المنتجات المخفضة لفترة محدودة'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSavePromoBanner} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* شارة العرض */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">شارة البنر العلوية (Badge)</label>
                <input
                  type="text"
                  required
                  value={promoBadge}
                  onChange={(e) => setPromoBadge(e.target.value)}
                  placeholder="خصومات حصرية"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* العنوان الرئيسي */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">العنوان الرئيسي للبنر *</label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="صفقات وتخفيضات اليوم"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* النص الفرعي / الوصف */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">الوصف / النص الفرعي</label>
                <input
                  type="text"
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  placeholder="تصفح المنتجات المخفضة لفترة محدودة"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* رابط التوجيه */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">رابط البنر عند الضغط</label>
                <input
                  type="text"
                  value={promoLink}
                  onChange={(e) => setPromoLink(e.target.value)}
                  placeholder="/offers"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* رفع صورة جديدة */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">صورة البنر (اختياري لتغيير الصورة الحالية)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePromoImageChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="promoIsActive"
                checked={promoIsActive}
                onChange={(e) => setPromoIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="promoIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                عرض البنر الثابت في الصفحة الرئيسية
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>حفظ وتطبيق تعديلات البنر الثابت</span>
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
