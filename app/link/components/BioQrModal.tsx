// app/link/components/BioQrModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Link2, Check, Share2 } from 'lucide-react';

interface BioQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  storeName?: string;
  logoSrc?: string;
}

export default function BioQrModal({
  isOpen,
  onClose,
  url,
  logoSrc = '/mylogo.png',
}: BioQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function generateQr() {
      setQrReady(false);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. توليد كود الـ QR بأبعاد مضبوطة على 210 بكسل بالضبط لتطابق حجم الحاوية وتمنع أي تمدد
        await QRCode.toCanvas(canvas, url, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 210, // مضبوطة على 210 بالضبط لمنع التمدد الرأسي
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });

        // 2. تفريغ مربع أبيض نقي في المنتصف (excavate: true) بحجم 48 بكسل لعزل نقاط الباركود
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const boxSize = 48;
          const boxX = Math.round((210 - boxSize) / 2);
          const boxY = Math.round((210 - boxSize) / 2);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(boxX, boxY, boxSize, boxSize);
        }

        if (isMounted) {
          setQrReady(true);
        }
      } catch (err) {
        console.error('QR generation error:', err);
      }
    }

    generateQr();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, url, onClose]);

  if (!isOpen) return null;

  // تنزيل الرمز بدقة عالية
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const downloadCanvas = document.createElement('canvas');
      const targetSize = 630;
      downloadCanvas.width = targetSize;
      downloadCanvas.height = targetSize;
      const dCtx = downloadCanvas.getContext('2d');

      if (dCtx) {
        dCtx.fillStyle = '#ffffff';
        dCtx.fillRect(0, 0, targetSize, targetSize);
        dCtx.drawImage(canvas, 0, 0, targetSize, targetSize);

        // إطار الشعار المفرغ
        const bSize = Math.round((48 / 210) * targetSize);
        const bX = (targetSize - bSize) / 2;
        const bY = (targetSize - bSize) / 2;
        dCtx.fillStyle = '#ffffff';
        dCtx.fillRect(bX, bY, bSize, bSize);

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = logoSrc;
        img.onload = () => {
          const pad = Math.round(bSize * 0.12);
          const lSize = bSize - pad * 2;
          dCtx.drawImage(img, bX + pad, bY + pad, lSize, lSize);
          const link = document.createElement('a');
          link.download = `alwasita-qr-${Date.now()}.png`;
          link.href = downloadCanvas.toDataURL('image/png', 1.0);
          link.click();
          setDownloading(false);
        };
        img.onerror = () => {
          const link = document.createElement('a');
          link.download = `alwasita-qr-${Date.now()}.png`;
          link.href = downloadCanvas.toDataURL('image/png', 1.0);
          link.click();
          setDownloading(false);
        };
      }
    } catch (e) {
      console.error('Download error:', e);
      setDownloading(false);
    }
  };

  // نسخ الرابط
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  // مشاركة الرابط
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'متجر الواسطة',
          text: 'روابط متجر الواسطة الرسمية',
          url: url,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* حاوية المحتوى الوسطى */}
      <div
        className="w-full max-w-[300px] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* البطاقة البيضاء الأولى (بطاقة الباركود) */}
        <div className="w-full bg-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative">
          
          {/* زر إغلاق (X) صغير في الزاوية العلوية */}
          <button
            onClick={onClose}
            className="absolute top-3.5 left-3.5 p-1.5 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full transition cursor-pointer"
            aria-label="إغلاق"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>

          {/* حاوية الـ QR Code المربعة تماماً والمحصورة داخل الكارد */}
          <div
            className="w-[210px] h-[210px] aspect-square flex items-center justify-center overflow-hidden mx-auto relative"
            style={{ width: '210px', height: '210px', maxWidth: '100%', maxHeight: '100%' }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain aspect-square block"
              style={{ width: '210px', height: '210px', display: 'block' }}
            />

            {/* شعار واحد فقط في المنتصف بأبعاد متساوية 44x44 بكسل بدون أي تمطيط أو تكرار */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md shadow-xs flex items-center justify-center pointer-events-none"
              style={{ width: '44px', height: '44px' }}
            >
              <img
                src={logoSrc}
                alt="Store Logo"
                className="w-full h-full object-contain aspect-square"
                style={{ width: '36px', height: '36px' }}
              />
            </div>
          </div>

          {/* أسفل الباركود مباشرة اسم المتجر بخط داكن واضح */}
          <div className="mt-3 text-center">
            <span className="text-sm font-bold text-zinc-900 tracking-tight block dir-ltr">
              alwasitastore.com
            </span>
          </div>

        </div>

        {/* البطاقة الثانية (شريط الأزرار أسفل البطاقة البيضاء مباشرة مثل إنستغرام) */}
        <div className="w-full bg-white rounded-2xl p-3 grid grid-cols-3 gap-2 shadow-xl">
          
          {/* 1. مشاركة */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 group-hover:bg-zinc-100 group-active:scale-95 transition shadow-xs">
              <Share2 className="w-5 h-5 text-zinc-800 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 mt-1">مشاركة</span>
          </button>

          {/* 2. نسخ الرابط */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 group-hover:bg-zinc-100 group-active:scale-95 transition shadow-xs">
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Link2 className="w-5 h-5 text-zinc-800 stroke-[1.75]" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 mt-1">
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </span>
          </button>

          {/* 3. تحميل */}
          <button
            onClick={handleDownload}
            disabled={!qrReady || downloading}
            className="flex flex-col items-center justify-center group cursor-pointer disabled:opacity-50"
            type="button"
          >
            <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 group-hover:bg-zinc-100 group-active:scale-95 transition shadow-xs">
              <Download className="w-5 h-5 text-zinc-800 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 mt-1">
              {downloading ? 'جاري التحميل...' : 'تحميل'}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}
