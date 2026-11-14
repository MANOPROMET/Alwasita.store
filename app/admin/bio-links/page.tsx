// app/admin/bio-links/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Link2,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Palette,
  QrCode,
  Share2,
  Smartphone,
  Check,
  X,
  Upload,
} from 'lucide-react';
import { BioLink, BioSettings, BioSocialLinks } from '@/types';
import { getProductImageUrl } from '@/lib/appwrite/utils';
import BioIcon, { getIconConfig } from '@/app/link/components/BioIcon';

const THEME_OPTIONS = [
  {
    id: 'beacons-dark',
    name: 'بيكونز داكن (Beacons Dark)',
    description: 'تدرج رمادي داكن عصري واحترافي',
    bgPreview: 'from-[#09090b] via-[#121217] to-[#09090b]',
    sampleBg: '#121217',
  },
  {
    id: 'purple-night',
    name: 'بنفسجي ملكي (هوية الواسطة)',
    description: 'تدرج بنفسجي داكن متطابق مع هوية المتجر',
    bgPreview: 'from-[#180d2b] via-[#0d0717] to-[#05020a]',
    sampleBg: '#180d2b',
  },
  {
    id: 'midnight-blue',
    name: 'أزرق كحلي (Midnight Blue)',
    description: 'تدرج كحلي عميق وفاخر',
    bgPreview: 'from-[#0a1128] via-[#040817] to-[#02040a]',
    sampleBg: '#0a1128',
  },
  {
    id: 'emerald-luxury',
    name: 'زمردي فاخر (Emerald Luxury)',
    description: 'أخضر ملكي داكن يوحي بالفخامة',
    bgPreview: 'from-[#041d14] via-[#02100b] to-[#010805]',
    sampleBg: '#041d14',
  },
  {
    id: 'sunset-glow',
    name: 'توهج الغروب (Sunset Glow)',
    description: 'تدرج دافئ بين الأرجواني والبنفسجي',
    bgPreview: 'from-[#2e1065] via-[#1e1145] to-[#0f0728]',
    sampleBg: '#2e1065',
  },
  {
    id: 'pure-black',
    name: 'أسود شاشات (Amoled Black)',
    description: 'خلفية سوداء بالكامل 100% مناسبة لجميع الأجهزة',
    bgPreview: 'from-black to-black',
    sampleBg: '#000000',
  },
  {
    id: 'custom',
    name: 'خلفية مخصصة (Custom Gradient / Color)',
    description: 'تحديد كود لون أو تدرج CSS يدوي',
    bgPreview: 'from-purple-900 to-indigo-900',
    sampleBg: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
  },
];

const BUTTON_STYLE_OPTIONS = [
  { id: 'glass-dark', name: 'زجاجي داكن (Glass Dark)', desc: 'أنيق وشفاف مع ضبابية خلفية' },
  { id: 'solid-dark', name: 'داكن مصمت (Solid Dark)', desc: 'لون داكن ثابت وبسيط' },
  { id: 'glass-purple', name: 'زجاجي بنفسجي (Glass Purple)', desc: 'توهج بنفسجي متناسق' },
  { id: 'outline', name: 'محدد الأطراف (Outline)', desc: 'إطار ناصع بدون خلفية' },
];

const POPULAR_ICONS = [
  { id: 'shopping-bag', label: 'المتجر الإلكتروني' },
  { id: 'sparkles', label: 'العروض والتخفيضات' },
  { id: 'whatsapp', label: 'واتساب' },
  { id: 'instagram', label: 'إنستغرام' },
  { id: 'facebook', label: 'فيسبوك' },
  { id: 'tiktok', label: 'تيك توك' },
  { id: 'telegram', label: 'تيليجرام' },
  { id: 'twitter', label: 'منصة إكس' },
  { id: 'youtube', label: 'يوتيوب' },
  { id: 'snapchat', label: 'سناب شات' },
  { id: 'phone', label: 'اتصال هاتفي' },
  { id: 'map-pin', label: 'موقع / فرع' },
  { id: 'globe', label: 'موقع إلكتروني' },
  { id: 'truck', label: 'الشحن والتوصيل' },
  { id: 'star', label: 'خدمة مميزة' },
  { id: 'mail', label: 'بريد إلكتروني' },
  { id: 'credit-card', label: 'طرق الدفع' },
  { id: 'external-link', label: 'رابط عام' },
];

export default function AdminBioLinksPage() {
  const [activeTab, setActiveTab] = useState<'links' | 'appearance'>('links');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. بيانات الإعدادات
  const [settings, setSettings] = useState<BioSettings>({
    title: 'متجر الواسطة',
    bio: '',
    theme: 'beacons-dark',
    customBg: '',
    buttonStyle: 'glass-dark',
    socialLinks: {},
    showQrModal: true,
    footerText: '',
  });

  const [social, setSocial] = useState<BioSocialLinks>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 2. قائمة الروابط
  const [links, setLinks] = useState<BioLink[]>([]);

  // نموذج إضافة / تعديل رابط
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<BioLink | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('shopping-bag');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsHighlighted, setFormIsHighlighted] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIconFile, setFormIconFile] = useState<File | null>(null);
  const [formIconPreview, setFormIconPreview] = useState<string | null>(null);

  // حوار تأكيد الحذف
  const [deleteConfirmLink, setDeleteConfirmLink] = useState<BioLink | null>(null);

  // تحميل البيانات
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resSettings, resLinks] = await Promise.all([
        fetch('/api/admin/bio/settings'),
        fetch('/api/admin/bio/links'),
      ]);

      const dataSettings = await resSettings.json();
      const dataLinks = await resLinks.json();

      if (dataSettings.success && dataSettings.settings) {
        setSettings(dataSettings.settings);
        let sLinks: BioSocialLinks = {};
        if (dataSettings.settings.socialLinks) {
          if (typeof dataSettings.settings.socialLinks === 'string') {
            try {
              sLinks = JSON.parse(dataSettings.settings.socialLinks);
            } catch {
              sLinks = {};
            }
          } else {
            sLinks = dataSettings.settings.socialLinks;
          }
        }
        setSocial(sLinks);
      }

      if (dataLinks.success && dataLinks.links) {
        setLinks(dataLinks.links);
      }
    } catch (err: any) {
      console.error('Error loading bio admin data:', err);
      setErrorMsg('تعذر تحميل البيانات، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // حفظ الإعدادات العامة والمظهر
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', settings.title || '');
      formData.append('bio', settings.bio || '');
      formData.append('theme', settings.theme || 'beacons-dark');
      formData.append('customBg', settings.customBg || '');
      formData.append('buttonStyle', settings.buttonStyle || 'glass-dark');
      formData.append('socialLinks', JSON.stringify(social));
      formData.append('showQrModal', String(settings.showQrModal));
      formData.append('footerText', settings.footerText || '');
      if (settings.avatarFileId) {
        formData.append('avatarFileId', settings.avatarFileId);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch('/api/admin/bio/settings', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل حفظ الإعدادات');
      }

      setAvatarFile(null);
      showSuccess('تم حفظ إعدادات وثيم صفحة الروابط بنجاح!');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setActionLoading(false);
    }
  };

  // فتح نموذج إضافة رابط
  const openAddLink = () => {
    setEditingLink(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormUrl('');
    setFormIcon('shopping-bag');
    setFormIsActive(true);
    setFormIsHighlighted(false);
    setFormSortOrder(links.length);
    setFormIconFile(null);
    setFormIconPreview(null);
    setLinkModalOpen(true);
  };

  // فتح نموذج تعديل رابط
  const openEditLink = (link: BioLink) => {
    setEditingLink(link);
    setFormTitle(link.title);
    setFormSubtitle(link.subtitle || '');
    setFormUrl(link.url);
    setFormIcon(link.icon || 'external-link');
    setFormIsActive(link.isActive);
    setFormIsHighlighted(Boolean(link.isHighlighted));
    setFormSortOrder(link.sortOrder);
    setFormIconFile(null);
    setFormIconPreview(link.iconImageFileId ? getProductImageUrl(link.iconImageFileId) : null);
    setLinkModalOpen(true);
  };

  // حفظ الرابط (إضافة أو تعديل)
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      setErrorMsg('يرجى كتابة عنوان الرابط والوجهة');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      if (editingLink) {
        formData.append('id', editingLink.$id);
      }
      formData.append('title', formTitle.trim());
      formData.append('subtitle', formSubtitle.trim());
      formData.append('url', formUrl.trim());
      formData.append('icon', formIcon);
      formData.append('isActive', String(formIsActive));
      formData.append('isHighlighted', String(formIsHighlighted));
      formData.append('sortOrder', String(formSortOrder));
      if (formIconFile) {
        formData.append('iconImage', formIconFile);
      } else if (editingLink?.iconImageFileId) {
        formData.append('iconImageFileId', editingLink.iconImageFileId);
      }

      const res = await fetch('/api/admin/bio/links', {
        method: editingLink ? 'PUT' : 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'تعذر حفظ الرابط');
      }

      setLinkModalOpen(false);
      showSuccess(editingLink ? 'تم تعديل الرابط بنجاح!' : 'تم إضافة الرابط بنجاح!');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الرابط');
    } finally {
      setActionLoading(false);
    }
  };

  // حذف رابط
  const handleDeleteLink = async () => {
    if (!deleteConfirmLink) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/bio/links?id=${deleteConfirmLink.$id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'تعذر حذف الرابط');
      }

      setDeleteConfirmLink(null);
      showSuccess('تم حذف الرابط بنجاح!');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setActionLoading(false);
    }
  };

  // تبديل حالة التفعيل
  const handleToggleActive = async (link: BioLink) => {
    try {
      const updated = !link.isActive;
      setLinks((prev) =>
        prev.map((l) => (l.$id === link.$id ? { ...l, isActive: updated } : l))
      );

      await fetch('/api/admin/bio/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: link.$id,
          title: link.title,
          url: link.url,
          isActive: updated,
          sortOrder: link.sortOrder,
        }),
      });
    } catch {
      loadData();
    }
  };

  // تبديل شارة التمييز
  const handleToggleHighlight = async (link: BioLink) => {
    try {
      const updated = !link.isHighlighted;
      setLinks((prev) =>
        prev.map((l) => (l.$id === link.$id ? { ...l, isHighlighted: updated } : l))
      );

      await fetch('/api/admin/bio/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: link.$id,
          title: link.title,
          url: link.url,
          isActive: link.isActive,
          isHighlighted: updated,
          sortOrder: link.sortOrder,
        }),
      });
    } catch {
      loadData();
    }
  };

  // تحريك للأعلى
  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index - 1];
    newLinks[index - 1] = temp;

    const reordered = newLinks.map((item, idx) => ({ ...item, sortOrder: idx }));
    setLinks(reordered);

    await fetch('/api/admin/bio/links/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((l) => ({ id: l.$id, sortOrder: l.sortOrder })),
      }),
    });
  };

  // تحريك للأسفل
  const moveDown = async (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + 1];
    newLinks[index + 1] = temp;

    const reordered = newLinks.map((item, idx) => ({ ...item, sortOrder: idx }));
    setLinks(reordered);

    await fetch('/api/admin/bio/links/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((l) => ({ id: l.$id, sortOrder: l.sortOrder })),
      }),
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. رأس الصفحة */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-primary-600">
              <Link2 className="w-6 h-6" />
              <span className="text-xs font-black tracking-wide bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                صفحة البايو التجميعية
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              إدارة صفحة الروابط (/link)
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              تحكم كامل بتصميم وروابط وثيم صفحة التجميع الرسمية على طريقة Beacons مع رمز QR مدمج.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <Link
              href="/link"
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black bg-purple-50 hover:bg-purple-100 text-primary-700 border border-purple-200/80 transition shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>معاينة الصفحة الحية</span>
            </Link>

            <button
              onClick={openAddLink}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة رابط جديد</span>
            </button>
          </div>
        </div>

        {/* تنبيهات النجاح والخطأ */}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* أزرار التبديل بين التبويبات */}
        <div className="flex border-b border-gray-100 mt-6 -mb-2 gap-4">
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-3 text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'links'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>قائمة الروابط ({links.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'appearance'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>المظهر، الشعار والثيم</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="text-xs font-bold text-gray-400">جاري تحميل بيانات صفحة الروابط...</span>
        </div>
      ) : activeTab === 'links' ? (
        
        /* 2. تبويب قائمة الروابط */
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900">الروابط المتاحة</h2>
                <p className="text-xs text-gray-500">
                  يمكنك إعادة ترتيب الروابط، تمييز الروابط المهمة، وتتبع عدد النقرات لكل رابط
                </p>
              </div>

              <span className="text-xs font-black text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                الإجمالي: {links.length}
              </span>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-primary-600 flex items-center justify-center mx-auto">
                  <Link2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-700">لا توجد روابط مضافة حتى الآن</p>
                <button
                  onClick={openAddLink}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition cursor-pointer"
                >
                  إضافة أول رابط
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div
                    key={link.$id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                      link.isActive
                        ? 'bg-gray-50/70 border-gray-200 hover:border-primary-300'
                        : 'bg-gray-50/40 border-gray-200/60 opacity-60'
                    }`}
                  >
                    {/* معلومات الرابط */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* أزرار الترتيب */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded-md text-gray-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDown(index)}
                          disabled={index === links.length - 1}
                          className="p-1 hover:bg-gray-200 rounded-md text-gray-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* أيقونة الرابط */}
                      <BioIcon
                        icon={link.icon}
                        iconImageFileId={link.iconImageFileId}
                        className="w-11 h-11 shrink-0 text-xs"
                      />

                      {/* النصوص والروابط */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-gray-900 truncate">
                            {link.title}
                          </h3>
                          {link.isHighlighted && (
                            <span className="text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>مميز</span>
                            </span>
                          )}
                        </div>
                        {link.subtitle && (
                          <p className="text-xs text-gray-500 truncate">{link.subtitle}</p>
                        )}
                        <p className="text-[11px] text-gray-400 font-mono truncate dir-ltr text-right">
                          {link.url}
                        </p>
                      </div>
                    </div>

                    {/* الإحصائيات والإجراءات */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-between sm:justify-end">
                      {/* عداد النقرات */}
                      <div
                        className="text-[11px] font-bold text-gray-600 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs"
                        title="إجمالي عدد النقرات على هذا الرابط"
                      >
                        👁️ {link.clicks || 0} نقرة
                      </div>

                      {/* زر تفعيل/تعطيل التمييز */}
                      <button
                        type="button"
                        onClick={() => handleToggleHighlight(link)}
                        className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                          link.isHighlighted
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-white text-gray-400 border-gray-200 hover:text-amber-500'
                        }`}
                        title={link.isHighlighted ? 'إلغاء التمييز' : 'تمييز الرابط بلون بارز'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>

                      {/* زر الإظهار / الإخفاء */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(link)}
                        className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                          link.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-white text-gray-400 border-gray-200'
                        }`}
                        title={link.isActive ? 'تعطيل الرابط مؤقتاً' : 'تفعيل وعرض الرابط'}
                      >
                        {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* زر التعديل */}
                      <button
                        type="button"
                        onClick={() => openEditLink(link)}
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-primary-600 hover:border-primary-200 transition cursor-pointer"
                        title="تعديل الرابط"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* زر الحذف */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmLink(link)}
                        className="p-2 rounded-xl bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                        title="حذف الرابط"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      ) : (

        /* 3. تبويب المظهر والإعدادات العامة */
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* أ) معلومات الحساب والنبذة */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base sm:text-lg font-black text-gray-900">المعلومات الأساسية والشعار</h2>
              <p className="text-xs text-gray-500">تظهر في أعلى صفحة الروابط تماماً كما في Beacons القياسي</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* رفع الشعار / الصورة الرمزية */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
                <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-md ring-2 ring-gray-200 shrink-0 relative flex items-center justify-center overflow-hidden">
                  <Image
                    src={
                      avatarPreview ||
                      (settings.avatarFileId
                        ? getProductImageUrl(settings.avatarFileId)
                        : '/mylogo.png')
                    }
                    alt="الشعار"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-right">
                  <h3 className="text-sm font-black text-gray-900">شعار المتجر (Avatar Logo)</h3>
                  <p className="text-xs text-gray-500">
                    يعرض داخل دائرة بيضاء بارزة في أعلى الصفحة. الافتراضي هو شعار المتجر الرسمي.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>تغيير صورة الشعار</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="text-xs text-red-600 hover:underline mr-2"
                    >
                      إلغاء التحديد
                    </button>
                  )}
                </div>
              </div>

              {/* الاسم / العنوان الرئيسي */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">اسم المتجر / العنوان *</label>
                <input
                  type="text"
                  required
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* نص التذييل */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">نص التذييل / حقوق النشر</label>
                <input
                  type="text"
                  value={settings.footerText || ''}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  placeholder="متجر الواسطة © جميع الحقوق محفوظة"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* النبذة التعريفية */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block">النبذة التعريفية القصيرة (Bio)</label>
                <textarea
                  rows={3}
                  value={settings.bio}
                  onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                  placeholder="اكتب نبذة تعريفية قصيرة تظهر تحت الشعار مباشرة..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* ب) اختيار الثيم وتدرج الخلفية */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base sm:text-lg font-black text-gray-900">ثيم الصفحة وألوان الخلفية</h2>
              <p className="text-xs text-gray-500">اختر الثيم الذي يناسب هويتك البصرية أو خصص تدرجاً حراً</p>
            </div>

            {/* شبكة الثيمات الجاهزة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, theme: theme.id })}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'border-primary-600 ring-2 ring-primary-500/20 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* شريط عينة اللون العلوي */}
                    <div
                      className="w-full h-8 rounded-lg border border-white/10 mb-2 shrink-0"
                      style={{ background: theme.sampleBg }}
                    />

                    <div>
                      <span className="text-xs font-black text-gray-900 block truncate">
                        {theme.name}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {theme.description}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="absolute top-2 left-2 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* إذا كان الثيم مخصص: يظهر حقل كود الـ CSS Gradient */}
            {settings.theme === 'custom' && (
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2 animate-fadeIn">
                <label className="text-xs font-bold text-gray-700 block">
                  كود خلفية مخصص (CSS Color or Linear-Gradient):
                </label>
                <input
                  type="text"
                  value={settings.customBg || ''}
                  onChange={(e) => setSettings({ ...settings, customBg: e.target.value })}
                  placeholder="linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%) أو #0f172a"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-[11px] text-gray-500">
                  يمكنك لصق أي تدرج CSS تريده من مواقع مثل cssgradient.io
                </p>
              </div>
            )}

            {/* نمط وتصميم الأزرار */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 block">نمط وتصميم كاردات الأزرار:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BUTTON_STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, buttonStyle: style.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      settings.buttonStyle === style.id
                        ? 'bg-purple-50 text-primary-700 border-primary-500 font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <span className="text-xs block font-bold">{style.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* تفعيل زر رمز QR */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-gray-900 block">تفعيل زر رمز الـ QR بالصفحة</span>
                <span className="text-[11px] text-gray-500 block">
                  يتيح للزوار فتح رمز QR دائم ومشاركته أو مسحه بكاميرا الهاتف
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showQrModal}
                  onChange={(e) => setSettings({ ...settings, showQrModal: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* ج) قنوات التواصل الاجتماعي العلوية */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base sm:text-lg font-black text-gray-900">أيقونات قنوات التواصل الاجتماعي</h2>
              <p className="text-xs text-gray-500">
                تظهر كأزرار دائرية سريعة أسفل النبذة التعريفية مباشرة (الحقول الفارغة لن تظهر)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <span>رقم الواتساب (مع المفتاح الدولي بدون +)</span>
                </label>
                <input
                  type="text"
                  value={social.whatsapp || ''}
                  onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })}
                  placeholder="967771211394"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">رابط حساب إنستغرام</label>
                <input
                  type="text"
                  value={social.instagram || ''}
                  onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                  placeholder="https://www.instagram.com/alwasita.store/"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">رابط صفحة فيسبوك</label>
                <input
                  type="text"
                  value={social.facebook || ''}
                  onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                  placeholder="https://www.facebook.com/alwasita.store/"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">رابط حساب تيك توك</label>
                <input
                  type="text"
                  value={social.tiktok || ''}
                  onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                  placeholder="https://www.tiktok.com/@alwasita"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">رابط أو معرف تيليجرام</label>
                <input
                  type="text"
                  value={social.telegram || ''}
                  onChange={(e) => setSocial({ ...social, telegram: e.target.value })}
                  placeholder="https://t.me/alwasita أو @alwasita"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">رابط منصة إكس (تويتر)</label>
                <input
                  type="text"
                  value={social.twitter || ''}
                  onChange={(e) => setSocial({ ...social, twitter: e.target.value })}
                  placeholder="https://x.com/alwasita"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">رقم الاتصال المباشر</label>
                <input
                  type="text"
                  value={social.phone || ''}
                  onChange={(e) => setSocial({ ...social, phone: e.target.value })}
                  placeholder="+967 772 872 245"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">البريد الإلكتروني الرسمي</label>
                <input
                  type="email"
                  value={social.email || ''}
                  onChange={(e) => setSocial({ ...social, email: e.target.value })}
                  placeholder="alwasita.stor@gmail.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* زر الحفظ العائم */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl flex items-center gap-2.5 transition shadow-md disabled:opacity-50 text-sm cursor-pointer"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات المظهر</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

      {/* 4. نافذة إضافة / تعديل رابط */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-gray-200 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                {editingLink ? 'تعديل الرابط' : 'إضافة رابط جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              {/* عنوان الرابط */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">عنوان أو اسم الزر *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: المتجر الإلكتروني، تواصل واتساب..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* وصف فرعي اختياري */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  وصف فرعي قصير (اختياري - يظهر تحت العنوان)
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="مثال: أحدث الهواتف الذكية مع شحن فوري"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* رابط الوجهة */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  رابط الوجهة (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://... أو /products"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* اختيار الأيقونة */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">أيقونة الزر:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {POPULAR_ICONS.map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => {
                        setFormIcon(ic.id);
                        setFormIconFile(null);
                        setFormIconPreview(null);
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        formIcon === ic.id && !formIconPreview
                          ? 'bg-purple-50 border-primary-500 text-primary-700 font-bold shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-purple-200'
                      }`}
                    >
                      <BioIcon icon={ic.id} className="w-7 h-7 text-xs" />
                      <span className="text-[10px] truncate max-w-[60px]">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* أو رفع صورة أيقونة مخصصة */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-600 block">
                  أو رفع صورة/أيقونة مخصصة للزر:
                </label>
                <div className="flex items-center gap-3">
                  {formIconPreview && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                      <Image src={formIconPreview} alt="أيقونة" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormIconFile(file);
                        setFormIconPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 hover:file:bg-gray-200 file:cursor-pointer"
                  />
                  {formIconPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormIconFile(null);
                        setFormIconPreview(null);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </div>

              {/* خيارات التمييز والتفعيل */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsHighlighted}
                    onChange={(e) => setFormIsHighlighted(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-gray-900 block">زر مميز (Highlighted)</span>
                    <span className="text-[10px] text-gray-500 block">توهج وشارة تلفت انتباه الزائر</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-gray-900 block">مفعّل ومعروض</span>
                    <span className="text-[10px] text-gray-500 block">يظهر للزوار في صفحة الروابط</span>
                  </div>
                </label>
              </div>

              {/* أزرار الإجراء */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{editingLink ? 'حفظ التعديلات' : 'إضافة الرابط'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. نافذة تأكيد الحذف */}
      {deleteConfirmLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">هل أنت متأكد من حذف هذا الرابط؟</h3>
              <p className="text-xs text-gray-500">
                سيتم حذف &quot;{deleteConfirmLink.title}&quot; نهائياً من صفحة الروابط وقاعدة البيانات.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLink(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
              >
                تراجع
              </button>

              <button
                type="button"
                onClick={handleDeleteLink}
                disabled={actionLoading}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
