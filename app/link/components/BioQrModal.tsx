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

        // 1. توليد كود الـ QR باللون الأسود الصريح (#000000) والأبيض الناصع (#ffffff)
        await QRCode.toCanvas(canvas, url, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 570, // دقة 3x للحفاظ على صفاء الخطوط داخل أبعاد 190px
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });

        // 2. إطار أبيض مربع مفرغ (excavate: true) في المنتصف
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const size = canvas.width; // 570
          // حجم الصندوق المفرغ في المنتصف (متوافق مع أبعاد 44px داخل 190px)
          const boxSize = Math.round((44 / 190) * size);
          const boxX = Math.round((size - boxSize) / 2);
          const boxY = Math.round((size - boxSize) / 2);

          ctx.fillStyle = '#ffffff';
          const cornerRadius = 6;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxSize, boxSize, cornerRadius);
          } else {
            ctx.rect(boxX, boxY, boxSize, boxSize);
          }
          ctx.fill();

          ctx.strokeStyle = '#e4e4e7';
          ctx.lineWidth = 2;
          ctx.stroke();

          // رسم الشعار أيضاً داخل الكانفاس ليظهر بجودة تامة عند تنزيل الصورة
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = logoSrc;
          img.onload = () => {
            if (!isMounted) return;
            const pad = Math.round(boxSize * 0.12);
            const logoW = boxSize - pad * 2;
            const logoH = boxSize - pad * 2;
            const aspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
            let dw = logoW,
              dh = logoH;
            let dx = boxX + pad,
              dy = boxY + pad;
            if (aspect > 1) {
              dh = logoW / aspect;
              dy += (logoH - dh) / 2;
            } else if (aspect < 1) {
              dw = logoH * aspect;
              dx += (logoW - dw) / 2;
            }
            ctx.drawImage(img, dx, dy, dw, dh);
            setQrReady(true);
          };
          img.onerror = () => {
            if (isMounted) setQrReady(true);
          };
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
  }, [isOpen, url, logoSrc, onClose]);

  if (!isOpen) return null;

  // تنزيل الرمز
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
      setTimeout(() => setDownloading(false), 400);
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

          {/* في المنتصف مكون الـ QR Code باللون الأسود الصريح وبأبعاد 190px */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: '190px', height: '190px', maxWidth: '100%' }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: '190px', height: '190px', maxWidth: '100%', display: 'block' }}
              className="rounded-lg aspect-square"
            />

            {/* الشعار في المنتصف بحجم 44x44 بكسل داخل مربع أبيض مع excavate: true */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md shadow-xs flex items-center justify-center pointer-events-none"
              style={{ width: '44px', height: '44px' }}
            >
              <img
                src={logoSrc}
                alt="Store Logo"
                className="w-full h-full object-contain"
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
