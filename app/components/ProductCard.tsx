'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Heart, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const { convertPrice } = useCurrency();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isLiked = isInWishlist(product.$id);

    // حساب نسبة الخصم إن وجد سعر سابق
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
        : 0;

    const mainPrice = convertPrice(product.price);
    const oldPrice = hasDiscount ? convertPrice(product.compareAtPrice) : null;

    return (
        <div className="card group relative flex flex-col justify-between overflow-hidden bg-white hover:border-[var(--color-primary-soft)] transition-all duration-300">

            {/* 1. منطقة الصورة والشارات */}
            <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                {/* زر الإعجاب والمفضلة (Like) */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    className={`absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer border ${
                        isLiked
                            ? 'bg-rose-50 border-rose-200 text-rose-600 scale-105'
                            : 'bg-white/90 border-gray-200/80 text-gray-400 hover:text-rose-500 hover:bg-white hover:scale-110'
                    }`}
                    title={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    aria-label={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                    <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* شارة الخصم */}
                {hasDiscount && (
                    <span className="badge badge-danger absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 font-bold text-[10px] sm:text-xs">
                        خصم {discountPercent}%
                    </span>
                )}

                {/* شارة حالة المنتج (جديد / مستخدم أمريكي / مستخدم محلي / إلخ) */}
                {product.conditionLabel && (
                    <span className={`absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg shadow-sm border backdrop-blur-xs ${
                        product.condition === 'used'
                            ? 'bg-amber-500/95 text-white border-amber-600'
                            : 'bg-emerald-600/95 text-white border-emerald-700'
                    }`}>
                        {product.conditionLabel}
                    </span>
                )}

                {/* صورة المنتج مع Skeleton Loader حديث وأيقونة جاري التحميل */}
                <Link href={`/products/${product.$id}`} className="block w-full h-full relative">
                    {isImageLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 animate-pulse">
                            <div className="w-11 h-11 rounded-2xl bg-white/90 shadow-2xs border border-slate-200/60 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-2 tracking-wide">
                                جاري التحميل...
                            </span>
                        </div>
                    )}
                    <Image
                        src={product.mainImageFileId || '/window.svg'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => setIsImageLoading(false)}
                        className={`object-contain p-4 group-hover:scale-105 transition-all duration-300 ${
                            isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}
                    />
                </Link>

                {/* أزرار سريعة تظهر عند التمرير */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <Link
                        href={`/products/${product.$id}`}
                        className="w-9 h-9 rounded-full bg-white shadow-md text-gray-700 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition pointer-events-auto"
                        aria-label="عرض التفاصيل"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* 2. تفاصيل المنتج */}
            <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3">
                <div>
                    {/* اسم التصنيف إن وجد */}
                    {typeof product.category === 'object' && product.category?.name && (
                        <span className="text-[11px] sm:text-xs text-gray-400 font-medium block mb-0.5 sm:mb-1">
                            {product.category.name}
                        </span>
                    )}

                    {/* عنوان المنتج */}
                    <Link href={`/products/${product.$id}`}>
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 line-clamp-2 hover:text-[var(--color-primary)] transition leading-snug">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* 3. السعر وزر الإضافة للسلة */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            {mainPrice.code === 'USD' && (
                                <span className="text-xs font-bold text-gray-500">$</span>
                            )}
                            <span className="text-sm sm:text-base md:text-lg font-black text-[var(--color-primary)]">
                                {mainPrice.formatted}
                            </span>
                            {mainPrice.code !== 'USD' && (
                                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                    {mainPrice.symbol}
                                </span>
                            )}
                        </div>
                        {oldPrice && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                {oldPrice.code === 'USD'
                                    ? `$${oldPrice.formatted}`
                                    : `${oldPrice.formatted} ${oldPrice.symbol}`}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition shadow-2xs shrink-0"
                        aria-label="إضافة إلى السلة"
                    >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}