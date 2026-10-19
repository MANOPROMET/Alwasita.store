'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Clock, Send, ChevronLeft, CheckCircle2, Mail } from 'lucide-react';
import { StoreSettings } from '@/types';

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Error fetching settings for contact:', err));
  }, []);

  const storeName = settings?.storeName || 'متجر الواسطة';
  const whatsappNumber = settings?.whatsappNumber || '967771211394';
  const phoneNumber = settings?.storePhone || whatsappNumber;
  const storeEmail = settings?.storeEmail || 'support@alwasita.com';
  const storeAddress = settings?.storeAddress || 'اليمن - حضرموت / صنعاء / عدن';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحباً ' + storeName + '، أرغب بالاستفسار عن...')}`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const inquiryType = (form.elements.namedItem('inquiryType') as HTMLSelectElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

    const formattedText = `*استفسار جديد من ${storeName}* 📱\n\n👤 *الاسم:* ${name}\n📞 *الهاتف:* ${phone || 'غير محدد'}\n📌 *نوع الطلب:* ${inquiryType}\n\n💬 *الرسالة:*\n${message}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedText)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      
      {/* 1. مسار التصفح (Breadcrumb) */}
      <div className="bg-white border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">اتصل بنا</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        
        {/* 2. ترويسة الصفحة */}
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
          <span className="inline-block text-xs sm:text-sm font-bold text-[var(--color-primary)] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            خدمة عملاء متجر الواسطة
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            نحن هنا لمساعدتك دائماً
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed font-normal">
            نسعد بالتواصل معك للإجابة على استفساراتك حول الأجهزة الذكية، تأكيد الطلبات، أو حلول الشبكات.
          </p>
        </div>

        {/* 3. شبكة المحتوى: معلومات التواصل + النموذج */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* العمود الجانبي: بطاقات التواصل المباشر */}
          <div className="space-y-4">
            
            {/* بطاقة الواتساب والاتصال الأساسية */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-5 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">واتساب وخدمة العملاء</h3>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    متاحون للرد السريع
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-1">
                <span className="text-xs text-gray-400 block">الرقم المباشر</span>
                <span className="text-base font-extrabold text-gray-800 tracking-wider dir-ltr inline-block">
                  {phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`}
                </span>
                {storeEmail && (
                  <span className="text-xs text-gray-500 block pt-1 border-t border-gray-200/60 font-mono">
                    {storeEmail}
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-1">
                {/* زر محادثة واتساب المباشرة */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة فورية عبر واتساب</span>
                </a>

                {/* زر الاتصال الهاتفي المباشر */}
                <a
                  href={`tel:+${phoneNumber.replace(/[^\d]/g, '')}`}
                  className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition text-xs border border-gray-200"
                >
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
              </div>
            </div>

            {/* بطاقة الموقع والفرع */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 border border-purple-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">موقع المتجر والتغطية</h4>
                  <p className="text-xs text-gray-500">{storeAddress}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {storeName} - شحن وتوصيل آمن لجميع الأجهزة والملحقات لكافة المحافظات والمناطق.
              </p>
            </div>

            {/* بطاقة أوقات العمل */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 border border-purple-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">ساعات العمل</h4>
                  <p className="text-xs text-gray-500">استقبال وتجهيز الطلبات</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                السبت – الخميس: 9:00 صباحاً – 10:00 مساءً<br />
                الجمعة: من 4:00 عصراً – 10:00 مساءً
              </p>
            </div>

          </div>

          {/* العمود الرئيسي: نموذج إرسال رسالة مباشر */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
              
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  أرسل استفسارك مباشرة
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  املأ البيانات وسيقوم النموذج بتجهيز رسالتك وإرسالها مباشرة إلى فريق المتجر على واتساب.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* حقول الاسم ورقم الهاتف */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      الاسم الكريم <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="أدخل اسمك الكريم"
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      رقم الهاتف (اختياري)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="رقم هاتفك للتواصل"
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                    />
                  </div>
                </div>

                {/* نوع الاستفسار */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    نوع الاستفسار أو الطلب
                  </label>
                  <select
                    name="inquiryType"
                    className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                  >
                    <option value="استفسار عن منتج متوفر">استفسار عن هاتف أو منتج معروض</option>
                    <option value="طلب كميات أو أجهزة خاصة">طلب كميات أو أجهزة خاصة</option>
                    <option value="متابعة حالة طلب سابق">متابعة حالة طلب تم إرساله</option>
                    <option value="حلول ومعدات الشبكات">استشارة أو تجهيز حلول شبكات</option>
                    <option value="استفسار عام آخر">موضوع أو استفسار عام آخر</option>
                  </select>
                </div>

                {/* نص الرسالة */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    نص الرسالة أو تفاصيل الطلب <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="اكتب تفاصيل طلبك أو استفسارك هنا وسنرد عليك بأقرب وقت..."
                    className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition resize-none leading-relaxed"
                  />
                </div>

                {/* زر الإرسال عبر هوية المتجر والواتساب */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال الاستفسار الآن عبر واتساب</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>يتم تحويل رسالتك مباشرة إلى المحادثة المعتمدة مع خدمة العملاء</span>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}