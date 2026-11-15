// app/link/components/BioQrModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, Share2, CheckCircle2 } from 'lucide-react';

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

  // إعداد رابط نظيف ومختصر للعرض أسفل الباركود
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

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
            dark: '#09090b',
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

          // حجم الصندوق الأبيض العازل في المنتصف (حوالي 22% من عرض الكود)
          const boxSize = Math.round(size * 0.22);
          const boxX = Math.round((size - boxSize) / 2);
          const boxY = Math.round((size - boxSize) / 2);

          // أ) رسم مساحة بيضاء مربعة نقية ومفرغة تماماً (Excavate Box)
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

  // تنزيل كارت الباركود بصيغة PNG عالية الدقة جاهزة للطباعة بجودة فائقة
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      // إنشاء كانفاس عالي الدقة للطباعة (1000 × 1280) متطابق مع كارت إنستغرام
      const printCanvas = document.createElement('canvas');
      const w = 1000;
      const h = 1280;
      printCanvas.width = w;
      printCanvas.height = h;
      const ctx = printCanvas.getContext('2d');

      if (ctx) {
        // 1. خلفية الكارت الأبيض
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // 2. إطار خارجي أنيق
        ctx.strokeStyle = '#e4e4e7';
        ctx.lineWidth = 6;
        ctx.strokeRect(30, 30, w - 60, h - 60);

        // 3. رسم كود الباركود بدقة عالية
        const qrSize = 680;
        const qrX = (w - qrSize) / 2;
        const qrY = 130;
        ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);

        // 4. خط فاصل ناعم
        ctx.strokeStyle = '#f4f4f5';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(120, 870);
        ctx.lineTo(w - 120, 870);
        ctx.stroke();

        // 5. اسم المتجر
        ctx.fillStyle = '#09090b';
        ctx.font = 'bold 46px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(storeName, w / 2, 950);

        // 6. الرابط الرسمي
        ctx.fillStyle = '#71717a';
        ctx.font = '28px monospace';
        ctx.fillText(displayUrl, w / 2, 1010);

        // 7. توجيه المسح
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '22px sans-serif';
        ctx.fillText('امسح الرمز بكاميرا الهاتف لفتح صفحة الروابط مباشرة', w / 2, 1070);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      {/* كارت الباركود الأبيض الأنيق والمحدد بحجم متوازن مثل إنستغرام */}
      <div
        className="relative w-full max-w-[315px] sm:max-w-[335px] bg-white rounded-[28px] p-5 sm:p-6 shadow-2xl border border-zinc-100 text-center flex flex-col items-center my-auto transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق داخل زاوية الكارت */}
        <button
          onClick={onClose}
          className="absolute top-3.5 left-3.5 p-1.5 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full transition cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* عنوان خفيف وأنيق أعلى الكارت */}
        <div className="pt-1 pb-1">
          <span className="text-[11px] font-bold tracking-wider text-zinc-400">
            رمز QR المتجر
          </span>
        </div>

        {/* حاوية الـ QR Code المتوازنة والمريحة للعين داخل الكارت الأبيض */}
        <div className="w-[165px] h-[165px] xs:w-[185px] xs:h-[185px] sm:w-[200px] sm:h-[200px] aspect-square flex items-center justify-center relative my-1.5">
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

        {/* اسم المتجر والمعرف تحت الباركود داخل نفس الكارت الأبيض */}
        <div className="mt-1 w-full text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1.5 text-zinc-900 font-extrabold text-base sm:text-lg tracking-tight">
            <span>{storeName}</span>
            <CheckCircle2 className="w-4 h-4 text-primary-600 fill-primary-600 stroke-white shrink-0" />
          </div>
          <p className="text-zinc-500 font-mono text-[11px] sm:text-xs dir-ltr font-medium truncate">
            {displayUrl}
          </p>
        </div>

        {/* خط فاصل ناعم */}
        <div className="w-full border-t border-zinc-100 my-3.5" />

        {/* أزرار التحكم الثلاثة الأفقية المنظمة تماماً مثل إنستغرام داخل الكارت */}
        <div className="w-full grid grid-cols-3 gap-2">
          
          {/* 1. مشاركة الرابط */}
          <button
            onClick={handleShare}
            className="py-2.5 px-1 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-800 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer"
            title="مشاركة الرابط"
          >
            <Share2 className="w-4 h-4 text-zinc-700" />
            <span className="text-[11px] font-bold">مشاركة</span>
          </button>

          {/* 2. نسخ الرابط */}
          <button
            onClick={handleCopy}
            className="py-2.5 px-1 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-800 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer"
            title="نسخ الرابط"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] text-emerald-600 font-bold">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-700" />
                <span className="text-[11px] font-bold">نسخ الرابط</span>
              </>
            )}
          </button>

          {/* 3. تحميل الرمز */}
          <button
            onClick={handleDownload}
            disabled={!qrReady || downloading}
            className="py-2.5 px-1 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
            title="تحميل الباركود عالي الدقة للطباعة"
          >
            <Download className="w-4 h-4" />
            <span className="text-[11px] font-bold">تحميل الرمز</span>
          </button>

        </div>

      </div>
    </div>
  );
}
