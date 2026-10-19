'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-zinc-950 aspect-[21/9] min-h-[240px] sm:min-h-[340px] max-h-[480px] shadow-lg border border-zinc-800/60 group">
      {/* حاوية الصور المتحركة */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.$id || index} className="relative w-full h-full flex-shrink-0">
            <Image
              src={banner.imageFileId || '/window.svg'}
              alt={banner.title || 'عرض ترويجي'}
              fill
              priority={index === 0}
              className="object-cover"
            />
            {/* تدرج لوني أرجواني ناعم وفاخر لتوضيح الخطوط */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent" />

            {/* تفاصيل البنر */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 lg:px-16 max-w-xl text-white space-y-4">
              {index === 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary-light)] text-[var(--color-primary-hover)] w-fit backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>عرض حصري مميز</span>
                </span>
              )}
              {banner.title && (
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
                  {banner.title}
                </h2>
              )}
              {banner.description && (
                <p className="text-xs sm:text-base text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                  {banner.description}
                </p>
              )}
              {banner.linkUrl && (
                <div className="pt-2">
                  <Link
                    href={banner.linkUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg transition transform active:scale-95"
                  >
                    اكتشف العرض الآن
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* أزرار التنقل الجانبية */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="السابق"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[var(--color-primary)] transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="التالي"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[var(--color-primary)] transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* مؤشرات التبديل السفلية */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`شريحة ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-9 bg-[var(--color-primary)]' : 'w-2.5 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}