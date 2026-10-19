'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Banner } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { getProductImageUrl } from '@/lib/appwrite/utils';

interface HeroProductSliderProps {
  banners?: Banner[];
  latestProducts: Product[];
  allProducts?: Product[];
}

export default function HeroProductSlider({
  banners,
  latestProducts,
  allProducts,
}: HeroProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { formatPrice } = useCurrency();

  // 1. استخراج بنرات السلايدر النشطة من الإدارة
  const activeHeroBanners = (banners || []).filter(
    (b) => b.isActive && b.bannerType !== 'promo'
  );

  const customSlides = activeHeroBanners.map((b) => {
    // إذا كان البنر مرتبطاً بمنتج محدد
    if (b.linkType === 'product' && b.productId) {
      const pool = allProducts && allProducts.length > 0 ? allProducts : latestProducts;
      const matched = pool.find((p) => p.$id === b.productId);

      // حساب أقل سعر من نسخ المنتج (variants) بدقة
      let lowestPrice = 0;
      if (matched?.variants && matched.variants.length > 0) {
        const prices = matched.variants
          .map((v) => Number(v.price) || 0)
          .filter((p) => p > 0);
        lowestPrice = prices.length > 0 ? Math.min(...prices) : Number(matched.price) || 0;
      } else {
        lowestPrice = Number(matched?.price) || 0;
      }

      const formattedLowest = lowestPrice > 0 ? formatPrice(lowestPrice) : '';
      const bannerImg = b.imageFileId
        ? getProductImageUrl(b.imageFileId)
        : matched?.mainImageFileId || '/window.svg';

      // استخدام النص الفرعي المخصص بالكامل كما كتبه الأدمن، أو السعر كقيمة افتراضية دون تكرار
      const sub = b.subtitle && b.subtitle.trim() !== ''
        ? b.subtitle
        : (formattedLowest || 'متوفر الآن في المتجر');

      return {
        id: b.$id,
        image: bannerImg,
        title: b.title || matched?.name || 'منتج مميز',
        subtitle: sub,
        linkUrl: b.linkValue || `/products/${b.productId}`,
        isProduct: true,
      };
    }

    // إعلان عادي مخصص
    return {
      id: b.$id,
      image: getProductImageUrl(b.imageFileId) || '/mainP.jpeg',
      title: b.title,
      subtitle: b.subtitle || 'متجر الواسطة الإلكتروني',
      linkUrl: b.linkValue || '/products',
      isProduct: false,
    };
  });

  // إذا قام الأدمن بإضافة بنرات رئيسية، نعرض فقط البنرات التي اختارها الأدمن ولا نخلط معها منتجات غير مضافة
  // في حال لم يضف أي بنر بعد، نعرض بنر ترحيبي مع أحدث المنتجات كافتراضي
  let slides = customSlides;
  if (customSlides.length === 0) {
    const defaultProductSlides = (latestProducts || []).slice(0, 4).map((prod) => {
      let minPrice = Number(prod.price) || 0;
      if (prod.variants && prod.variants.length > 0) {
        const prices = prod.variants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
        if (prices.length > 0) minPrice = Math.min(...prices);
      }
      return {
        id: prod.$id,
        image: prod.mainImageFileId || '/window.svg',
        title: prod.name,
        subtitle: minPrice > 0 ? formatPrice(minPrice) : '',
        linkUrl: `/products/${prod.$id}`,
        isProduct: true,
      };
    });

    const introSlide = [{
      id: 'main-intro',
      image: '/mainP.jpeg',
      title: 'أحدث الهواتف والتقنيات',
      subtitle: 'متجر الواسطة الإلكتروني',
      linkUrl: '/products',
      isProduct: false,
    }];

    slides = [...introSlide, ...defaultProductSlides];
  }

  // المؤقت الزمني لحركة السلايدر التلقائية كل 3.5 ثانية
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-purple-900/30 shadow-2xl min-h-[300px] sm:min-h-[340px] md:min-h-[380px] group bg-gradient-to-br from-purple-950/40 via-zinc-950 to-zinc-900">
      
      {/* محتوى الشريحة الحالية */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Link
              href={slide.linkUrl}
              className="w-full h-full p-4 sm:p-8 md:p-12 flex flex-col-reverse md:flex-row items-center justify-between gap-3 sm:gap-6 md:gap-10 cursor-pointer"
            >
              {/* الجانب الأيمن (نصوص وبيانات محفزة) */}
              <div className="w-full md:w-1/2 flex flex-col justify-center items-start text-right space-y-2 sm:space-y-4 z-10">
                {/* اسم المنتج / الإعلان */}
                <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug line-clamp-1 sm:line-clamp-2">
                  {slide.title}
                </h3>

                {/* السعر والزر بجانب بعض لتوفير المساحة في وضع الجوال */}
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full pt-1">
                  {slide.subtitle && (
                    <span className="text-lg sm:text-2xl md:text-3xl font-black text-[var(--color-primary-soft)] drop-shadow">
                      {slide.subtitle}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all shrink-0">
                    <span>{slide.isProduct ? 'عرض المواصفات' : 'تصفح المتجر'}</span>
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 rtl:rotate-0" />
                  </span>
                </div>
              </div>

              {/* الجانب الأيسر (صورة الجهاز كاملة بأطراف دائرية أنيقة وبدون أي قص أو تشويه) */}
              <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-80 relative flex items-center justify-center p-2">
                <div className="relative inline-flex items-center justify-center rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-purple-500/30 transition-all">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={500}
                    height={350}
                    priority={index === 0}
                    className="max-h-[200px] sm:max-h-[260px] md:max-h-[290px] w-auto h-auto object-contain rounded-2xl sm:rounded-3xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </Link>
          </div>
        );
      })}

      {/* أزرار التنقل الجانبية */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/70 flex items-center justify-center transition border border-white/10 cursor-pointer"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-0" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/70 flex items-center justify-center transition border border-white/10 cursor-pointer"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-0" />
          </button>

          {/* نقاط التنقل السفلية (Indicators) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 h-1.5 bg-[var(--color-primary-soft)]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`انتقل إلى الشريحة ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
}
