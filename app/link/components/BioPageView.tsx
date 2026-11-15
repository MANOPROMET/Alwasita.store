// app/link/components/BioPageView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BioSettings, BioLink, BioSocialLinks } from '@/types';
import { getProductImageUrl } from '@/lib/appwrite/utils';
import BioLinkCard from './BioLinkCard';
import BioQrModal from './BioQrModal';
import {
  QrCode,
  Share2,
  CheckCircle2,
  Check,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaTelegram,
  FaXTwitter,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa6';

interface BioPageViewProps {
  initialSettings: BioSettings;
  initialLinks: BioLink[];
  storeLogo?: string;
}

export default function BioPageView({
  initialSettings,
  initialLinks,
  storeLogo = '/mylogo.png',
}: BioPageViewProps) {
  const [settings] = useState<BioSettings>(initialSettings);
  const [links] = useState<BioLink[]>(initialLinks);
  const [qrOpen, setQrOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // استخراج الشعار المعتمد
  const avatarUrl = settings.avatarFileId
    ? getProductImageUrl(settings.avatarFileId)
    : storeLogo;

  // استخراج شبكات التواصل
  let social: BioSocialLinks = {};
  if (settings.socialLinks) {
    if (typeof settings.socialLinks === 'string') {
      try {
        social = JSON.parse(settings.socialLinks);
      } catch {
        social = {};
      }
    } else {
      social = settings.socialLinks;
    }
  }

  // تجهيز خلفية الصفحة حسب الثيم المختار
  let bgClass = 'bg-gradient-to-b from-[#09090b] via-[#121217] to-[#09090b]';
  let customStyle: React.CSSProperties = {};

  switch (settings.theme) {
    case 'purple-night':
      bgClass = 'bg-gradient-to-b from-[#180d2b] via-[#0d0717] to-[#05020a]';
      break;
    case 'midnight-blue':
      bgClass = 'bg-gradient-to-b from-[#0a1128] via-[#040817] to-[#02040a]';
      break;
    case 'emerald-luxury':
      bgClass = 'bg-gradient-to-b from-[#041d14] via-[#02100b] to-[#010805]';
      break;
    case 'sunset-glow':
      bgClass = 'bg-gradient-to-b from-[#2e1065] via-[#1e1145] to-[#0f0728]';
      break;
    case 'pure-black':
      bgClass = 'bg-black';
      break;
    case 'custom':
      if (settings.customBg) {
        bgClass = '';
        customStyle = { background: settings.customBg };
      }
      break;
    default:
      bgClass = 'bg-gradient-to-b from-[#09090b] via-[#121217] to-[#09090b]';
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const handleShareClick = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: settings.title,
          text: settings.bio,
          url: currentUrl || 'https://alwasitastore.com/link',
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div
      className={`min-h-screen text-white relative flex flex-col justify-between selection:bg-purple-600 selection:text-white ${bgClass}`}
      style={customStyle}
    >
      {/* عناصر توهج جمالية ناعمة بالخلفية */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[350px] h-[300px] bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* المحتوى الرئيسي المتمركز في المنتصف كما في Beacons القياسي */}
      <main className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 flex-1 flex flex-col">
        
        {/* شريط الإجراءات العلوي */}
        <div className="flex items-center justify-between pb-6">
          {/* زر الباركود */}
          {settings.showQrModal && (
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 backdrop-blur-md transition cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              title="عرض وتنزيل رمز QR للمتجر"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-400" />
              <span>رمز QR</span>
            </button>
          )}

          <div className="flex-1" />

          {/* زر المشاركة */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 backdrop-blur-md transition cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
            title="مشاركة الصفحة"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">تم النسخ!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-zinc-300" />
                <span>مشاركة</span>
              </>
            )}
          </button>
        </div>

        {/* 1. قسم الشعار والنبذة التعريفية */}
        <div className="text-center space-y-4 pt-2 pb-6">
          {/* الشعار داخل دائرة بيضاء بارزة ونظيفة */}
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-2 shadow-2xl ring-4 ring-white/15 mx-auto flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <Image
                src={avatarUrl}
                alt={settings.title}
                width={112}
                height={112}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {/* شارة التوثيق */}
            <div
              className="absolute bottom-1 left-1 bg-white rounded-full p-0.5 shadow-md"
              title="حساب رسمي موثق"
            >
              <CheckCircle2 className="w-5 h-5 text-primary-600 fill-primary-600 stroke-white" />
            </div>
          </div>

          {/* اسم المتجر / العنوان الرئيسي */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>{settings.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed font-normal">
              {settings.bio}
            </p>
          </div>

          {/* 2. شريط أيقونات التواصل الاجتماعي الدائرية */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {social.whatsapp && (
              <a
                href={
                  social.whatsapp.startsWith('http')
                    ? social.whatsapp
                    : `https://wa.me/${social.whatsapp.replace(/\D/g, '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="واتساب"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
            )}

            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="إنستغرام"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
            )}

            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue-600 hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="فيسبوك"
              >
                <FaFacebookF className="w-3.5 h-3.5" />
              </a>
            )}

            {social.tiktok && (
              <a
                href={social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-black hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="تيك توك"
              >
                <FaTiktok className="w-3.5 h-3.5" />
              </a>
            )}

            {social.telegram && (
              <a
                href={
                  social.telegram.startsWith('http')
                    ? social.telegram
                    : `https://t.me/${social.telegram.replace('@', '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-sky-500 hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="تيليجرام"
              >
                <FaTelegram className="w-4 h-4" />
              </a>
            )}

            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-black hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="منصة إكس"
              >
                <FaXTwitter className="w-3.5 h-3.5" />
              </a>
            )}

            {social.phone && (
              <a
                href={`tel:${social.phone.replace(/\s+/g, '')}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-600 hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="اتصال هاتفي"
              >
                <FaPhone className="w-3.5 h-3.5" />
              </a>
            )}

            {social.email && (
              <a
                href={`mailto:${social.email}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-indigo-600 hover:text-white text-zinc-300 border border-white/10 backdrop-blur-md flex items-center justify-center transition duration-200 hover:scale-110"
                title="بريد إلكتروني"
              >
                <FaEnvelope className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* 3. قائمة الروابط على شكل كاردات أفقية */}
        <div className="space-y-3 sm:space-y-3.5 flex-1">
          {links.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 bg-white/5 rounded-2xl border border-white/10">
              لا توجد روابط مضافة حالياً.
            </div>
          ) : (
            links.map((link) => (
              <BioLinkCard
                key={link.$id}
                link={link}
                buttonStyle={settings.buttonStyle}
              />
            ))
          )}
        </div>

        {/* 4. تذييل الصفحة والعلامة التجارية */}
        <footer className="pt-10 pb-4 text-center space-y-2">
          <p className="text-xs text-zinc-400 font-medium">
            {settings.footerText || 'متجر الواسطة © جميع الحقوق محفوظة'}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white transition group py-1"
          >
            <span>زيارة المتجر الإلكتروني</span>
            <ExternalLink className="w-3 h-3 group-hover:-translate-x-0.5 transition" />
          </Link>
        </footer>

      </main>

      {/* نافذة عرض وتنزيل الـ QR Code */}
      <BioQrModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        url={currentUrl || 'https://alwasitastore.com/link'}
        storeName={settings.title}
        logoSrc={avatarUrl}
      />
    </div>
  );
}
