// app/link/components/BioQrModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Link2, Check, Share2 } from 'lucide-react';

interface BioQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  storeName: string;
  logoSrc?: string;
}

export default function BioQrModal({
  isOpen,
  onClose,
  url,
  storeName,
  logoSrc = '/mylogo.png',
}: BioQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  // اسم المعرف المطابق لإنستغرام
  const displayHandle = 'alwasitastore';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function generateQrWithLogo() {
      setQrReady(false);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. توليد كود الـ QR بدقة فائقة ومستوى تصحيح خطأ عالي (H) يسمح بدمج الشعار بنقاء تام
        await QRCode.toCanvas(canvas, url, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 700,
          color: {
            dark: '#18181b',
            light: '#ffffff',
          },
        });

        // 2. تحميل ورسم الشعار المربع داخل مساحة بيضاء مفرغة نقية في المنتصف
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = logoSrc;

        img.onload = () => {
          if (!isMounted) return;

          const size = canvas.width; // 700

          // حجم الصندوق الأبيض العازل في المنتصف (حوالي 23% من عرض الكود)
          const boxSize = Math.round(size * 0.23);
          const boxX = Math.round((size - boxSize) / 2);
          const boxY = Math.round((size - boxSize) / 2);

          // أ) رسم مساحة بيضاء مربعة نقية ومفرغة تماماً (Excavate Box)
          ctx.save();
          ctx.fillStyle = '#ffffff';
          const cornerRadius = 8;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxSize, boxSize, cornerRadius);
          } else {
            ctx.rect(boxX, boxY, boxSize, boxSize);
          }
          ctx.fill();

          // إطار ناعم يعزل المربع الأبيض عن نقاط الباركود
          ctx.strokeStyle = '#e4e4e7';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();

          // ب) مساحة بيضاء مفرغة نقية حول الشعار (Padding)
          const padding = Math.round(boxSize * 0.12);
          const logoAreaSize = boxSize - (padding * 2);
          const logoAreaX = boxX + padding;
          const logoAreaY = boxY + padding;

          // ج) رسم الشعار المربع بنقاء وحفظ أبعاده الأصلية بدون قص دائري
          const imgW = img.naturalWidth || img.width;
          const imgH = img.naturalHeight || img.height;
          const aspect = imgW / imgH;

          let drawW = logoAreaSize;
          let drawH = logoAreaSize;
          let drawX = logoAreaX;
          let drawY = logoAreaY;

          if (aspect > 1) {
            drawH = logoAreaSize / aspect;
            drawY = logoAreaY + (logoAreaSize - drawH) / 2;
          } else if (aspect < 1) {
            drawW = logoAreaSize * aspect;
            drawX = logoAreaX + (logoAreaSize - drawW) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          setQrReady(true);
        };

        img.onerror = () => {
          if (isMounted) setQrReady(true);
        };
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }

    generateQrWithLogo();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, url, logoSrc, onClose]);

  if (!isOpen) return null;

  // تنزيل كارت الباركود عالي الدقة بصيغة PNG جاهزة للطباعة
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const printCanvas = document.createElement('canvas');
      const w = 1000;
      const h = 1200;
      printCanvas.width = w;
      printCanvas.height = h;
      const ctx = printCanvas.getContext('2d');

      if (ctx) {
        // خلفية بيضاء نقية
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // إطار ناعم
        ctx.strokeStyle = '#e4e4e7';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, w - 60, h - 60);

        // رسم كود الباركود في المنتصف
        const qrSize = 700;
        const qrX = (w - qrSize) / 2;
        const qrY = 120;
        ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);

        // كتابة المعرف بنفس ألوان إنستغرام
        const gradient = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0);
        gradient.addColorStop(0, '#ea335d');
        gradient.addColorStop(1, '#d62976');
        ctx.fillStyle = gradient;
        ctx.font = 'bold 54px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`@${displayHandle}`, w / 2, 920);

        // كتابة اسم المتجر ورابط الموقع
        ctx.fillStyle = '#71717a';
        ctx.font = '28px sans-serif';
        ctx.fillText(storeName || 'متجر الواسطة', w / 2, 980);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '22px monospace';
        ctx.fillText('alwasitastore.com/link', w / 2, 1030);

        const link = document.createElement('a');
        link.download = `alwasita-instagram-qr-${Date.now()}.png`;
        link.href = printCanvas.toDataURL('image/png', 1.0);
        link.click();
      } else {
        const link = document.createElement('a');
        link.download = `alwasita-qr-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (e) {
      console.error('Download error:', e);
      const link = document.createElement('a');
      link.download = `alwasita-qr-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  // نسخ الرابط للحافظة
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // مشاركة الرابط
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: `روابط وقنوات ${storeName} الرسمية`,
          url: url,
        });
      } catch {
        // cancelled by user
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#f99f1b] via-[#ea335d] to-[#d62976] transition-opacity duration-200 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      {/* زر إغلاق دائري في الزاوية العلوية */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 p-2 text-white/90 hover:text-white bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-md transition cursor-pointer z-50 shadow-md"
        aria-label="إغلاق"
      >
        <X className="w-6 h-6" />
      </button>

      {/* الحاوية المركزية التي تجمع الكارتين تماماً مثل إنستغرام وبحجم متزن ومريح */}
      <div
        className="w-full max-w-[275px] xs:max-w-[290px] sm:max-w-[310px] flex flex-col items-center gap-3.5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. كارت الباركود الأبيض (Top QR Card) */}
        <div className="w-full bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl flex flex-col items-center justify-center">
          
          {/* حاوية الـ QR Code المتوازنة */}
          <div className="w-[155px] h-[155px] xs:w-[170px] xs:h-[170px] sm:w-[185px] sm:h-[185px] aspect-square flex items-center justify-center relative my-0.5">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block aspect-square"
            />
            {!qrReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-xl">
                <span className="text-xs font-bold text-zinc-700 animate-pulse">جاري إنشاء الرمز...</span>
              </div>
            )}
          </div>

          {/* المعرف أو اسم المتجر بخط إنستغرام المتدرج تماماً مثل الصورة */}
          <div className="mt-2.5 text-center">
            <span className="text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ea335d] to-[#d62976] dir-ltr font-mono block">
              @{displayHandle}
            </span>
          </div>

        </div>

        {/* 2. كارت أزرار التحكم السفلي المنفصل تماماً مثل الصورة المرفقة */}
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl py-3 px-4 sm:py-3.5 sm:px-5 shadow-2xl flex items-center justify-around">
          
          {/* زر المشاركة */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-zinc-200/90 flex items-center justify-center text-zinc-800 bg-white group-hover:bg-zinc-50 group-active:scale-95 transition shadow-xs">
              <Share2 className="w-5 h-5 text-zinc-800 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 mt-1.5">
              مشاركة
            </span>
          </button>

          {/* زر نسخ الرابط */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-zinc-200/90 flex items-center justify-center text-zinc-800 bg-white group-hover:bg-zinc-50 group-active:scale-95 transition shadow-xs">
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Link2 className="w-5 h-5 text-zinc-800 stroke-[1.75]" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 mt-1.5">
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </span>
          </button>

          {/* زر التنزيل */}
          <button
            onClick={handleDownload}
            disabled={!qrReady || downloading}
            className="flex flex-col items-center group cursor-pointer disabled:opacity-50"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-zinc-200/90 flex items-center justify-center text-zinc-800 bg-white group-hover:bg-zinc-50 group-active:scale-95 transition shadow-xs">
              <Download className="w-5 h-5 text-zinc-800 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 mt-1.5">
              {downloading ? 'جاري التحميل...' : 'تنزيل'}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}
