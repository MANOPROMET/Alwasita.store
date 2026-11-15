// app/link/components/BioQrModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Link2, Check, Share2, CheckCircle2 } from 'lucide-react';

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

  // إعداد رابط نظيف ومختصر للعرض
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function generateQrWithLogo() {
      setQrReady(false);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. توليد كود الـ QR باللون الأسود الصريح (#000000) والأبيض الناصع (#ffffff) ومستوى تصحيح خطأ عالي (H)
        await QRCode.toCanvas(canvas, url, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 800,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });

        // 2. رسم الشعار داخل إطار أبيض مربع مفرغ تماماً (excavate: true) يحمي نقاط الكود
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = logoSrc;

        img.onload = () => {
          if (!isMounted) return;

          const size = canvas.width; // 800

          // حجم الصندوق الأبيض العازل في المنتصف (حوالي 22% من عرض الكود)
          const boxSize = Math.round(size * 0.22);
          const boxX = Math.round((size - boxSize) / 2);
          const boxY = Math.round((size - boxSize) / 2);

          // أ) رسم مساحة بيضاء مربعة نقية ومفرغة بالكامل (excavate box)
          ctx.save();
          ctx.fillStyle = '#ffffff';
          const cornerRadius = 6;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxSize, boxSize, cornerRadius);
          } else {
            ctx.rect(boxX, boxY, boxSize, boxSize);
          }
          ctx.fill();

          // إطار رمادي دقيق ونظيف
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();

          // ب) مساحة بيضاء مفرغة نقية حول الشعار
          const padding = Math.round(boxSize * 0.12);
          const logoAreaSize = boxSize - (padding * 2);
          const logoAreaX = boxX + padding;
          const logoAreaY = boxY + padding;

          // ج) رسم الشعار المربع بأبعاده الأصلية بنقاء تام وبدون أي قص دائري
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
      const h = 1250;
      printCanvas.width = w;
      printCanvas.height = h;
      const ctx = printCanvas.getContext('2d');

      if (ctx) {
        // خلفية بيضاء ناصعة
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // إطار ناعم
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, w - 60, h - 60);

        // رسم كود الباركود في المنتصف
        const qrSize = 720;
        const qrX = (w - qrSize) / 2;
        const qrY = 120;
        ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);

        // كتابة اسم المتجر
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 46px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(storeName || 'متجر الواسطة', w / 2, 930);

        // كتابة رابط الصفحة
        ctx.fillStyle = '#64748b';
        ctx.font = '28px monospace';
        ctx.fillText(displayUrl, w / 2, 990);

        // عبارة توجيهية للطباعة
        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px sans-serif';
        ctx.fillText('امسح الرمز لزيارة صفحة الروابط وقنوات التواصل', w / 2, 1050);

        const link = document.createElement('a');
        link.download = `alwasita-qr-${Date.now()}.png`;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-fadeIn"
      onClick={onClose}
    >
      {/* زر إغلاق في زاوية الشاشة */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition cursor-pointer z-50 shadow-md"
        aria-label="إغلاق"
        type="button"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* الحاوية المركزية الثابتة العرض في منتصف الشاشة تماماً */}
      <div
        className="w-full max-w-[320px] flex flex-col items-center gap-3 my-auto pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. بطاقة الباركود باللون الأبيض الناصع وبمقاس ثابت ومناسب للهواتف */}
        <div className="w-full bg-white rounded-2xl p-6 shadow-2xl border border-zinc-100 flex flex-col items-center text-center">
          
          {/* حاوية الـ QR Code بمقاس 200x200 بكسل كحد أقصى */}
          <div className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] max-w-[200px] max-h-[200px] aspect-square flex items-center justify-center relative my-1">
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

          {/* اسم المتجر والمعرف بالهوية البصرية الرسمية */}
          <div className="mt-3 text-center space-y-0.5 w-full">
            <div className="flex items-center justify-center gap-1.5 text-zinc-900 font-extrabold text-base tracking-tight">
              <span>{storeName}</span>
              <CheckCircle2 className="w-4 h-4 text-primary-600 fill-primary-600 stroke-white shrink-0" />
            </div>
            <p className="text-zinc-500 font-mono text-xs dir-ltr font-medium truncate">
              {displayUrl}
            </p>
          </div>

        </div>

        {/* 2. بطاقة أزرار التحكم الأفقية المضغوطة أسفل بطاقة الباركود مثل إنستغرام وبألوان الهوية */}
        <div className="w-full bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-zinc-100 flex items-center justify-around">
          
          {/* زر المشاركة */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 bg-zinc-50 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-200 group-active:scale-95 transition shadow-xs">
              <Share2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-bold text-zinc-700 group-hover:text-primary-600 mt-1.5 transition">
              مشاركة
            </span>
          </button>

          {/* زر نسخ الرابط */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 bg-zinc-50 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-200 group-active:scale-95 transition shadow-xs">
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Link2 className="w-5 h-5 stroke-[1.75]" />
              )}
            </div>
            <span className="text-[11px] font-bold text-zinc-700 group-hover:text-primary-600 mt-1.5 transition">
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </span>
          </button>

          {/* زر تحميل الرمز */}
          <button
            onClick={handleDownload}
            disabled={!qrReady || downloading}
            className="flex flex-col items-center group cursor-pointer disabled:opacity-50"
            type="button"
          >
            <div className="w-11 h-11 rounded-full border border-primary-200 bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 group-active:scale-95 transition shadow-xs">
              <Download className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-bold text-zinc-700 group-hover:text-primary-600 mt-1.5 transition">
              {downloading ? 'جاري التحميل...' : 'تحميل الرمز'}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}
