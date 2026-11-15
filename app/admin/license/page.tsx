// app/admin/license/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  Copy,
  Check,
  Smartphone,
  Send,
  Trash2,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  ChevronLeft,
  User,
  Hash,
  FileText,
  Search,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';

interface GeneratedLicense {
  id: string;
  machineId: string;
  licenseKey: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
}

const SECRET_SALT = 'AlwastaPOS_Secure_2026_SecretKey';

// دالة احتياطية لتوليد المفتاح محلياً في المتصفح باستخدام Web Crypto API
async function calculateLicenseKeyClient(machineId: string): Promise<string> {
  const normalizedId = machineId.trim().toUpperCase();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_SALT),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(normalizedId));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const part1 = hashHex.substring(0, 4);
  const part2 = hashHex.substring(4, 8);
  const part3 = hashHex.substring(8, 12);
  return `ACT-${part1}-${part2}-${part3}`;
}

export default function AdminLicensePage() {
  const [machineId, setMachineId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<GeneratedLicense | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState<GeneratedLicense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // استرجاع سجل التراخيص من localStorage عند فتح الصفحة
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wasita_pos_licenses_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load license history from storage', e);
    }
  }, []);

  // حفظ السجل عند التحديث
  const saveHistory = (items: GeneratedLicense[]) => {
    setHistory(items);
    try {
      localStorage.setItem('wasita_pos_licenses_history', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save license history', e);
    }
  };

  // توليد كود التفعيل
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanId = machineId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMessage('يرجى إدخال معرّف الجهاز (Machine ID)');
      return;
    }

    setLoading(true);
    let licenseKey = '';

    try {
      // محاولة التوليد عبر خادم الـ API
      const res = await fetch('/api/admin/license/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: cleanId,
          customerName,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success && data.licenseKey) {
        licenseKey = data.licenseKey;
      } else {
        // بديل محلي في حال حدوث خطأ في الاتصال
        licenseKey = await calculateLicenseKeyClient(cleanId);
      }
    } catch (err) {
      // Fallback محلي فوري
      licenseKey = await calculateLicenseKeyClient(cleanId);
    } finally {
      setLoading(false);
    }

    const newRecord: GeneratedLicense = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      machineId: cleanId,
      licenseKey,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setCurrentResult(newRecord);

    // إضافة الكود إلى رأس السجل (مع حد أقصى 50 كود)
    const updatedHistory = [newRecord, ...history.filter((h) => h.machineId !== cleanId || h.licenseKey !== licenseKey)].slice(0, 50);
    saveHistory(updatedHistory);
  };

  // نسخ كود التفعيل فقط
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // نسخ رسالة التفعيل الكاملة
  const handleCopyFullMessage = (item: GeneratedLicense) => {
    const text = buildWhatsAppMessage(item);
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  // إنشاء نص رسالة التفعيل
  const buildWhatsAppMessage = (item: GeneratedLicense) => {
    const greeting = item.customerName ? `مرحباً بك أخي / أختي (${item.customerName}) 👋` : 'مرحباً بك عزيزي العميل 👋';
    return `${greeting}
يسعدنا تزويدك بكود تفعيل تطبيق *الواسطة المحاسبي (Alwasita POS)*:

📱 *معرّف الجهاز (Machine ID):*
${item.machineId}

🔑 *كود التفعيل (License Key):*
${item.licenseKey}

📌 *خطوات التفعيل:*
1. افتح تطبيق الواسطة المحاسبي على جهازك.
2. الصق كود التفعيل في خانة "كود التفعيل".
3. اضغط على زر (تفعيل النسخة) وسيتم تفعيل التطبيق بنجاح وبشكل دائم.

نسعد بخدمتكم دائماً ✨
*متجر الواسطة*`;
  };

  // إرسال عبر واتساب
  const handleOpenWhatsApp = (item: GeneratedLicense) => {
    const text = encodeURIComponent(buildWhatsAppMessage(item));
    let url = `https://api.whatsapp.com/send?text=${text}`;
    if (item.customerPhone) {
      const cleanPhone = item.customerPhone.replace(/[^0-9]/g, '');
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
    }
    window.open(url, '_blank');
  };

  // لصق من الحافظة في خانة معرّف الجهاز
  const handlePasteMachineId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMachineId(text.trim().toUpperCase());
      }
    } catch {
      // Clipboard access might be denied
    }
  };

  // حذف عنصر من السجل
  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
  };

  // مسح السجل كاملاً
  const handleClearHistory = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الأكواد المحفوظة في السجل المحلي؟')) {
      saveHistory([]);
      setCurrentResult(null);
    }
  };

  // تصفية السجل بناءً على البحث
  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.machineId.toLowerCase().includes(q) ||
      item.licenseKey.toLowerCase().includes(q) ||
      (item.customerName && item.customerName.toLowerCase().includes(q)) ||
      (item.customerPhone && item.customerPhone.includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* الترويسة ومسار التنقل */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Link href="/admin" className="hover:text-primary-600 transition">
            لوحة التحكم
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-primary-600">تراخيص التطبيق المحاسبي</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/70 shadow-xs">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/70 mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>نظام التفعيل أوفلاين (Offline Machine ID)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2.5">
              <span>مولّد تراخيص تطبيق الواسطة المحاسبي</span>
              <span className="text-amber-500 text-2xl">🔑</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-2xl">
              توليد مفاتيح وأكواد تفعيل دائمة لعملاء تطبيق الأندرويد المحاسبي باستخدام معرّف الجهاز (Machine ID) وخوارزمية التشفير القياسية HMAC-SHA256.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 text-primary-700 border border-purple-100 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              <span>مفتاح التشفير متطابق مع تطبيق الأندرويد 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* قسم النموذج وتوليد المفتاح */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* نموذج الإدخال (يمين / الأعلى) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900">بيانات جهاز العميل</h2>
                  <p className="text-xs text-gray-500">أدخل المعرف المستخرج من شاشة التفعيل بالتطبيق</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* حقل معرّف الجهاز Machine ID */}
              <div>
                <label className="block text-xs font-black text-gray-800 mb-2">
                  معرّف الجهاز (Machine ID) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value.toUpperCase())}
                    placeholder="مثال: WST-A1B2-C3D4"
                    className="w-full pr-10 pl-24 py-3.5 rounded-2xl border border-gray-300 bg-gray-50/50 text-gray-900 font-mono font-bold text-center tracking-wider text-base focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition outline-none uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={handlePasteMachineId}
                    className="absolute inset-y-1.5 left-1.5 px-3 rounded-xl bg-gray-200/70 hover:bg-gray-300 text-gray-700 text-xs font-bold flex items-center gap-1 transition"
                    title="لصق من الحافظة"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>لصق</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  يظهر هذا المعرّف للعميل داخل شاشة تفعيل تطبيق الأندرويد المحاسبي.
                </p>
              </div>

              {/* حقول إضافية لتنظيم وتسهيل المراسلة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    اسم العميل أو المحل (اختياري)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثلاً: سوبرماركت الواحة / أبو فهد"
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    رقم هاتف العميل (لواتساب اختياري)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="tel"
                      dir="ltr"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+967770000000"
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-left"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ملاحظات إضافية (اختياري)
                </label>
                <div className="relative">
                  <div className="absolute top-3 right-3 pointer-events-none text-gray-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات حول الترخيص، نوع الاشتراك، أو البائع..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* أزرار الإجراء */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || !machineId.trim()}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-700 hover:from-primary-700 hover:to-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري توليد الكود...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 text-amber-300" />
                      <span>توليد كود التفعيل الآن</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMachineId('');
                    setCustomerName('');
                    setCustomerPhone('');
                    setNotes('');
                    setErrorMessage('');
                  }}
                  className="py-3.5 px-4 rounded-2xl border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-bold transition"
                  title="تفريغ الحقول"
                >
                  مسح
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* كارد النتيجة (يسار / الأسفل) */}
        <div className="lg:col-span-5 space-y-6">
          {currentResult ? (
            <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700/80 space-y-5 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-amber-400">
                    تم توليد كود التفعيل بنجاح ✨
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(currentResult.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* تفاصيل العميل والمعرف */}
              <div className="space-y-1 bg-white/5 p-3.5 rounded-2xl border border-white/5 text-xs">
                {currentResult.customerName && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">العميل / المحل:</span>
                    <span className="font-bold text-white">{currentResult.customerName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">معرّف الجهاز (ID):</span>
                  <span className="font-mono font-bold text-sky-300 tracking-wider">
                    {currentResult.machineId}
                  </span>
                </div>
              </div>

              {/* صندوق كود التفعيل البارز */}
              <div className="space-y-2 text-center py-2">
                <span className="text-[11px] font-bold text-slate-400">
                  كود التفعيل الرقمي (License Key):
                </span>
                <div className="bg-black/50 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-inner relative group">
                  <div
                    dir="ltr"
                    className="text-xl sm:text-2xl font-black font-mono tracking-widest text-emerald-400 select-all cursor-pointer"
                    onClick={() => handleCopyKey(currentResult.licenseKey)}
                    title="انقر لنسخ الكود"
                  >
                    {currentResult.licenseKey}
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات السريعة للكود المولّد */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyKey(currentResult.licenseKey)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    copiedKey === currentResult.licenseKey
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black'
                  }`}
                >
                  {copiedKey === currentResult.licenseKey ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم نسخ الكود بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ كود التفعيل فقط</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(currentResult)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>إرسال واتساب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyFullMessage(currentResult)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedMsg ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم نسخ الرسالة</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرسالة كاملة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
                <KeyRound className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">بانتظار إدخال معرّف الجهاز</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  ضع معرّف جهاز العميل واضغط على زر التوليد وسيظهر كود التفعيل هنا مباشرة مع خيارات النسخ والإرسال السريع.
                </p>
              </div>
            </div>
          )}

          {/* صندوق الإرشادات السريعة */}
          <div className="bg-purple-50/60 rounded-3xl border border-purple-100 p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary-800 font-bold text-xs">
              <HelpCircle className="w-4 h-4" />
              <span>كيف يعمل التفعيل في تطبيق الأندرويد؟</span>
            </div>
            <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>كل جهاز أندرويد يمتلك معرّف فريد خاص به (Machine ID) يظهر عند فتح التطبيق.</li>
              <li>الخوارزمية تطبق توقيع HMAC-SHA256 رقمي مشفر غير قابل للتخمين أو التكرار.</li>
              <li>الكود بصيغة <span className="font-mono font-bold text-primary-700">ACT-XXXX-XXXX-XXXX</span> يفعل التطبيق أوفلاين دون الحاجة لاتصال جهاز العميل بالإنترنت.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* سجل الأكواد المولدة مؤخراً */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">سجل التراخيص المولّدة مؤخراً</h2>
              <p className="text-xs text-gray-500">يتم حفظ آخر الأكواد محلياً في متصفحك لسهولة الرجوع إليها وإعادة إرسالها</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح السجل</span>
              </button>
            )}
          </div>
        </div>

        {/* شريط البحث في السجل */}
        {history.length > 0 && (
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في السجل عن اسم العميل، معرّف الجهاز، أو كود التفعيل..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          </div>
        )}

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-black text-gray-500">
                  <th className="py-3 px-4 rounded-r-xl">العميل / المحل</th>
                  <th className="py-3 px-4">معرّف الجهاز (Machine ID)</th>
                  <th className="py-3 px-4">كود التفعيل (License Key)</th>
                  <th className="py-3 px-4">تاريخ التوليد</th>
                  <th className="py-3 px-4 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/20 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {item.customerName || <span className="text-gray-400 font-normal">غير محدد</span>}
                      {item.customerPhone && (
                        <div className="text-[11px] text-gray-500 font-mono font-normal">
                          {item.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                      {item.machineId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        <span>{item.licenseKey}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyKey(item.licenseKey)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition"
                          title="نسخ كود التفعيل"
                        >
                          {copiedKey === item.licenseKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(item)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition"
                          title="إرسال عبر واتساب"
                        >
                          <FaWhatsapp className="w-3.5 h-3.5 text-emerald-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400 transition"
                          title="حذف من السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400 text-xs space-y-1">
            <p>لا توجد أكواد تفعيل مولدة في السجل حتى الآن.</p>
            <p className="text-[11px] text-gray-400">ستظهر هنا تلقائياً بمجرد توليد أول كود تفعيل.</p>
          </div>
        )}
      </div>
    </div>
  );
}
