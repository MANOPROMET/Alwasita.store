// app/link/components/BioQrModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { X, Download, Copy, Check, Share2, QrCode } from 'lucide-react';

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

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function generateQrWithLogo() {
      setQrReady(false);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. توليد كود الـ QR بدقة فائقة ومستوى تصحيح خطأ عالي (H) يسمح بوضع الشعار في المنتصف دون تشويش
        await QRCode.toCanvas(canvas, url, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 600,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        // 2. تحميل ورسم الشعار المربع في منتصف الكود مع مساحة بيضاء مفرغة (Excavate)
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = logoSrc;

        img.onload = () => {
          if (!isMounted) return;

          const size = canvas.width; // 600

          // مقاس الصندوق الأبيض العازل في المنتصف (حوالي 24% من عرض الباركود)
          // هذا الحجم متوافق 100% مع مستوى تصحيح الخطأ العالي H دون الإخلال ببيانات الكود
          const boxSize = Math.round(size * 0.24);
          const boxX = Math.round((size - boxSize) / 2);
          const boxY = Math.round((size - boxSize) / 2);

          // 1. رسم مساحة بيضاء مربعة نقية ومفرغة بالكامل (White Excavation Box)
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

          // إطار ناعم ونظيف جداً يعزل المربع الأبيض عن نقاط الباركود
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();

          // 2. حساب المسافة الهامشية البيضاء النقية حول الشعار (Margin / Padding)
          const padding = Math.round(boxSize * 0.12); // مساحة بيضاء نقية مفرغة
          const logoAreaSize = boxSize - (padding * 2);
          const logoAreaX = boxX + padding;
          const logoAreaY = boxY + padding;

          // 3. الحفاظ على أبعاد الشعار الأصلية ورسمه بشكل مربع ونظيف داخل المساحة المفرغة
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

          // رسم الشعار كمربع نقي كامل بدون أي قص دائري
          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          setQrReady(true);
        };

        img.onerror = () => {
          // في حال تعذر تحميل الشعار، يظل كود الـ QR يعمل بشكل سليم
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

  // تنزيل كود الـ QR بصيغة PNG عالية الدقة
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `alwasita-qr-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (e) {
      console.error('Download error:', e);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-[360px] sm:max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl text-center text-white flex flex-col justify-between max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto">
        
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 sm:top-4 left-4 p-1.5 sm:p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer z-10"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* رأس النافذة */}
        <div className="space-y-1 pt-0.5 shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-1">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">رمز QR الخاص بالمتجر</h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            امسح الرمز بكاميرا هاتفك لفتح وتصفح صفحة الروابط التجميعية مباشرة
          </p>
        </div>

        {/* بطاقة عرض الـ QR Code مع الشعار المربع والمساحة المفرغة النظيفة */}
        <div className="my-2.5 sm:my-3.5 flex items-center justify-center shrink-0">
          <div className="relative p-2.5 sm:p-3.5 bg-white rounded-2xl shadow-xl border border-white/20 w-[190px] h-[190px] xs:w-[210px] xs:h-[210px] sm:w-[240px] sm:h-[240px] max-h-[36vh] aspect-square flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block rounded-lg aspect-square"
            />
            {!qrReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-2xl">
                <span className="text-xs font-bold text-zinc-700 animate-pulse">جاري إنشاء الرمز...</span>
              </div>
            )}
          </div>
        </div>

        {/* عنوان الرابط */}
        <div className="mb-2.5 sm:mb-3 py-1.5 px-3 bg-black/40 border border-white/5 rounded-xl text-center text-[11px] sm:text-xs font-mono text-zinc-400 truncate dir-ltr shrink-0">
          {url}
        </div>

        {/* أزرار الإجراءات - ظاهرة دائماً بالكامل أسفل الشاشة دون الحاجة للتمرير */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-0.5 shrink-0">
          <button
            onClick={handleDownload}
            disabled={!qrReady || downloading}
            className="py-2.5 px-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل الرمز</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2.5 px-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border border-white/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border border-white/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة</span>
          </button>
        </div>

      </div>
    </div>
  );
}
