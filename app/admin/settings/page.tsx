'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  ArrowRight,
  Store,
  Phone,
  MessageCircle,
  Coins,
  CheckCircle2,
  Loader2,
  Calculator,
  Sparkles,
  Mail,
  MapPin,
  Share2,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [storeName, setStoreName] = useState('متجر الواسطة');
  const [storePhone, setStorePhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('SAR');
  const [exchangeRateYer, setExchangeRateYer] = useState<number>(412);
  const [exchangeRateUsd, setExchangeRateUsd] = useState<number>(3.82);

  // بيانات التواصل والموقع وحسابات التواصل
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');

  // نصوص السياسات التوضيحية
  const [shippingInfo, setShippingInfo] = useState('');
  const [returnPolicyInfo, setReturnPolicyInfo] = useState('');

  // حاسبة تجريبية لمعاينة المصارفة
  const [testAmountSar, setTestAmountSar] = useState<number>(1000);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setStoreName(s.storeName || 'متجر الواسطة');
          setStorePhone(s.storePhone || '');
          setWhatsappNumber(s.whatsappNumber || '');
          setStoreDescription(s.storeDescription || '');
          setDefaultCurrency(s.defaultCurrency || 'SAR');
          setExchangeRateYer(Number(s.exchangeRateYer) || 412);
          setExchangeRateUsd(Number(s.exchangeRateUsd) || 3.82);

          setStoreEmail(s.storeEmail || '');
          setStoreAddress(s.storeAddress || '');
          setFacebookUrl(s.facebookUrl || '');
          setInstagramUrl(s.instagramUrl || '');
          setTwitterUrl(s.twitterUrl || '');
          setTiktokUrl(s.tiktokUrl || '');
          setTelegramUrl(s.telegramUrl || '');
          setShippingInfo(s.shippingInfo || 'شحن آمن وسريع لجميع المحافظات. تكلفة الشحن تكون على العميل غالباً، وتكون شاملة مجانية في عروض ترويجية محددة.');
          setReturnPolicyInfo(s.returnPolicyInfo || 'الإرجاع متاح فقط في حالة وجود خلل فني أو مصنعي مثبت، مع ضرورة إشعار المتجر خلال مدة أقصاها يوم واحد (24 ساعة) من استلام الطلب.');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          storePhone,
          whatsappNumber,
          storeDescription,
          defaultCurrency: 'SAR',
          exchangeRateYer,
          exchangeRateUsd,
          storeEmail,
          storeAddress,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          tiktokUrl,
          telegramUrl,
          shippingInfo,
          returnPolicyInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('تم حفظ وتحديث إعدادات المتجر وبيانات التواصل والسياسات بنجاح!');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  // مخرجات الحاسبة
  const calculatedYer = Math.round(testAmountSar * (exchangeRateYer || 412));
  const calculatedUsd = Number((testAmountSar / (exchangeRateUsd || 3.82)).toFixed(2));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>لوحة التحكم الرئيسية</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">إعدادات المتجر والمصارفة</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            تخصيص بيانات المتجر العامة، أرقام التواصل، والعملة الأساسية وأسعار الصرف.
          </p>
        </div>
      </div>

      {/* التنبيهات */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs sm:text-sm font-bold">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="text-xs font-bold text-gray-500">جاري تحميل إعدادات المتجر...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. نظام العملات والمصارفة */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-black text-gray-900">العملة الأساسية وأسعار الصرف</h2>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-primary-700 rounded-full border border-purple-200">
                الريال السعودي (SAR) هو العملة الأساسية للمنتجات
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* العملة الأساسية */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">العملة الرسمية للمتجر</label>
                <input
                  type="text"
                  disabled
                  value="الريال السعودي (SAR - ر.س)"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-400">
                  جميع أسعار المنتجات في قاعدة البيانات تُسجل بالريال السعودي وتتحول تلقائياً للعملات الأخرى.
                </p>
              </div>

              {/* سعر صرف الريال السعودي مقابل اليمني */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  قيمة الريال السعودي بالريال اليمني (YER) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    value={exchangeRateYer}
                    onChange={(e) => setExchangeRateYer(Number(e.target.value))}
                    placeholder="412"
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                  <span className="text-xs font-bold text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2">
                    🇾🇪 ر.ي
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  كل 1 ريال سعودي يعادل <span className="font-bold text-gray-800">{exchangeRateYer || 412}</span> ريال يمني.
                </p>
              </div>

              {/* سعر صرف الدولار مقابل السعودي */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">
                  قيمة الدولار الواحد ($ USD) بالريال السعودي *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    value={exchangeRateUsd}
                    onChange={(e) => setExchangeRateUsd(Number(e.target.value))}
                    placeholder="3.82"
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                  <span className="text-xs font-bold text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2">
                    🇸🇦 ر.س
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  الدولار الواحد يعادل <span className="font-bold text-gray-800">{exchangeRateUsd || 3.82}</span> ريال سعودي (سعر المنتج بالدولار = السعر بالسعودي ÷ {exchangeRateUsd || 3.82}).
                </p>
              </div>

            </div>

            {/* محاكاة ومعاينة حية للمصارفة */}
            <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-bold text-gray-800">معاينة حية لتحويل العملات:</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                  <span>سعر تجريبي:</span>
                  <input
                    type="number"
                    value={testAmountSar}
                    onChange={(e) => setTestAmountSar(Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-mono text-center"
                  />
                  <span>ر.س</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-purple-100/80 text-center">
                  <span className="text-[11px] text-gray-400 block mb-0.5">🇸🇦 بالريال السعودي (الأساسي)</span>
                  <span className="text-base font-black text-gray-900">
                    {testAmountSar.toLocaleString()} ر.س
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-purple-100/80 text-center">
                  <span className="text-[11px] text-gray-400 block mb-0.5">🇾🇪 بالريال اليمني</span>
                  <span className="text-base font-black text-primary-700">
                    {calculatedYer.toLocaleString()} ر.ي
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-purple-100/80 text-center">
                  <span className="text-[11px] text-gray-400 block mb-0.5">🇺🇸 بالدولار الأمريكي</span>
                  <span className="text-base font-black text-emerald-700">
                    ${calculatedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 2. معلومات الهوية والاسم */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <Store className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-black text-gray-900">هوية المتجر والوصف</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">اسم المتجر الرسمي *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">الوصف التعريفي للمتجر</label>
                <textarea
                  rows={3}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 3. أرقام التواصل وقنوات الاتصال */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <Phone className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-black text-gray-900">أرقام التواصل والواتساب</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  رقم الواتساب المعتمد لتلقي الطلبات *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="967771211394"
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <MessageCircle className="w-4 h-4 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-gray-400">
                  الرقم الذي تصله رسائل تأكيد السلة والطلبات من العملاء.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">رقم خدمة العملاء (الاتصال)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="967772872245"
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Phone className="w-4 h-4 text-primary-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* البريد الإلكتروني للمتجر */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">البريد الإلكتروني الرسمي</label>
                <div className="relative">
                  <input
                    type="email"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    placeholder="support@alwasita.com"
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Mail className="w-4 h-4 text-primary-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* العنوان والموقع الجغرافي */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">العنوان والموقع الجغرافي</label>
                <div className="relative">
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="اليمن - صنعاء / عدن"
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <MapPin className="w-4 h-4 text-rose-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. حسابات ومواقع التواصل الاجتماعي */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <Share2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-black text-gray-900">حسابات التواصل الاجتماعي (تظهر بالفوتر)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">رابط فيسبوك (Facebook)</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">رابط انستغرام (Instagram)</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">رابط إكس / تويتر (X / Twitter)</label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">رابط تيك توك (TikTok)</label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">رابط قناة أو حساب تيليجرام (Telegram)</label>
                <input
                  type="url"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* 5. السياسات التوضيحية (الشحن والإرجاع) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <Truck className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-black text-gray-900">سياسات الشحن والإرجاع (نصوص الصفحات الثابتة والفوتر)</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <label className="text-xs font-bold text-gray-700">سياسة وتفاصيل الشحن والتوصيل</label>
                </div>
                <textarea
                  rows={3}
                  value={shippingInfo}
                  onChange={(e) => setShippingInfo(e.target.value)}
                  placeholder="اكتب تفاصيل الشحن والتوصيل..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
                />
                <p className="text-[11px] text-gray-400">
                  تظهر في صفحة الشحن والتوصيل ومربعات معلومات المنتج.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <label className="text-xs font-bold text-gray-700">سياسة وتفاصيل الإرجاع والاستبدال</label>
                </div>
                <textarea
                  rows={3}
                  value={returnPolicyInfo}
                  onChange={(e) => setReturnPolicyInfo(e.target.value)}
                  placeholder="اكتب شروط وضوابط الإرجاع والاستبدال..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
                />
                <p className="text-[11px] text-gray-400">
                  تظهر في صفحة سياسة الإرجاع ومربعات الضمان.
                </p>
              </div>
            </div>
          </div>

          {/* زر الحفظ */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl flex items-center gap-3 transition shadow-md disabled:opacity-50 text-base cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري حفظ الإعدادات وأسعار الصرف...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>حفظ جميع التغييرات</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
