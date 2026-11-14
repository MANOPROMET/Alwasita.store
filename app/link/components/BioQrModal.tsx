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

        // 2. تحميل ورسم الشعار في منتصف الكود
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = logoSrc;

        img.onload = () => {
          if (!isMounted) return;

          const size = canvas.width;
          const center = size / 2;
          const logoRadius = size * 0.13; // نصف قطر دائرة الشعار
          const logoDiameter = logoRadius * 2;

          // رسم خلفية بيضاء دائرية مع حدود ناعمة خلف الشعار
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, logoRadius + 8, 0, Math.PI * 2, true);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
          ctx.fill();
          ctx.restore();

          // رسم إطار خارجي ملون خفيف للدائرة
          ctx.beginPath();
          ctx.arc(center, center, logoRadius + 8, 0, Math.PI * 2, true);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#e2e8f0';
          ctx.stroke();

          // قص دائري لرسم الشعار داخله بنظافة
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, logoRadius, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(
            img,
            center - logoRadius,
            center - logoRadius,
            logoDiameter,
            logoDiameter
          );
          ctx.restore();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-sm sm:max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5 text-white">
        
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس النافذة */}
        <div className="space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">رمز QR الخاص بالمتجر</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            امسح الرمز بكاميرا هاتفك لفتح وتصفح صفحة الروابط التجميعية مباشرة
          </p>
        </div>

        {/* بطاقة عرض الـ QR Code مع الشعار المدمج */}
        <div className="relative p-4 sm:p-5 bg-white rounded-2xl shadow-inner max-w-[280px] sm:max-w-[300px] mx-auto border border-white/20">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block rounded-lg aspect-square"
          />
          {!qrReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl">
              <span className="text-xs font-bold text-zinc-700 animate-pulse">جاري إنشاء الرمز...</span>
            </div>
          )}
        </div>

        {/* عنوان الرابط */}
        <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-center text-xs font-mono text-zinc-400 truncate dir-ltr">
          {url}
        </div>

        {/* أزرار الإجراءات */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={handleDownload}
            disabled={!qrReady || downloading}
            className="py-2.5 px-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 shadow-md hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل الرمز</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border border-white/10 hover:scale-[1.02] cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border border-white/10 hover:scale-[1.02] cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة</span>
          </button>
        </div>

      </div>
    </div>
  );
}
