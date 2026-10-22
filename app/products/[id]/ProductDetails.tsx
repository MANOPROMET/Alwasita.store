'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    ShoppingCart,
    MessageCircle,
    ShieldCheck,
    Truck,
    ArrowRight,
    Check,
    Heart,
    Cpu,
    HardDrive,
    Camera,
    Palette,
    PenTool,
    Monitor,
    Wifi,
    Radio,
    Zap,
    Sparkles,
    Layers,
} from 'lucide-react';
import Link from 'next/link';
import { Product, Variant, Color } from '@/types';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductDetailsProps {
    product: Product;
}

// دالة اختيار الأيقونة المناسبة للخاصية بناء على مسمّاها
function getSpecIcon(label: string) {
    const l = (label || '').toLowerCase();
    if (l.includes('معالج') || l.includes('بروسيسور') || l.includes('cpu') || l.includes('chip')) {
        return <Cpu className="w-5 h-5" />;
    }
    if (l.includes('ذاكر') || l.includes('رام') || l.includes('ram') || l.includes('تخزين') || l.includes('storage') || l.includes('rom')) {
        return <HardDrive className="w-5 h-5" />;
    }
    if (l.includes('كاميرا') || l.includes('كيمرا') || l.includes('تصوير') || l.includes('camera') || l.includes('عدس')) {
        return <Camera className="w-5 h-5" />;
    }
    if (l.includes('لون') || l.includes('ألوان') || l.includes('الوان') || l.includes('color')) {
        return <Palette className="w-5 h-5" />;
    }
    if (l.includes('قلم') || l.includes('pen') || l.includes('stylus')) {
        return <PenTool className="w-5 h-5" />;
    }
    if (l.includes('شاش') || l.includes('screen') || l.includes('display') || l.includes('مقاس')) {
        return <Monitor className="w-5 h-5" />;
    }
    if (l.includes('شبك') || l.includes('واي فاي') || l.includes('wifi') || l.includes('router') || l.includes('راوتر') || l.includes('مودم') || l.includes('5g') || l.includes('4g') || l.includes('lte') || l.includes('سرع')) {
        return <Wifi className="w-5 h-5" />;
    }
    if (l.includes('تردد') || l.includes('هوائي') || l.includes('نطاق') || l.includes('تغطي')) {
        return <Radio className="w-5 h-5" />;
    }
    if (l.includes('شاحن') || l.includes('شحن') || l.includes('بطار') || l.includes('power') || l.includes('battery') || l.includes('mah') || l.includes('واط') || l.includes('watt') || l.includes('w')) {
        return <Zap className="w-5 h-5" />;
    }
    if (l.includes('حماي') || l.includes('ضمان') || l.includes('مقاوم') || l.includes('water') || l.includes('ip68') || l.includes('ip67')) {
        return <ShieldCheck className="w-5 h-5" />;
    }
    return <Sparkles className="w-5 h-5" />;
}

// دالة تحويل اسم اللون بالعربي/الانجليزي إلى كود لون دقيق وتحديد التباين
function getColorStyle(colorName?: string, hexCode?: string) {
    if (hexCode && hexCode.trim() && hexCode !== '#000' && hexCode !== '#000000') {
        return { 
            bg: hexCode, 
            border: hexCode.toLowerCase() === '#ffffff' || hexCode.toLowerCase() === '#fff' ? '#cbd5e1' : undefined, 
            isLight: hexCode.toLowerCase() === '#ffffff' || hexCode.toLowerCase() === '#fff' 
        };
    }
    
    const name = (colorName || '').trim().toLowerCase();
    
    if (name.includes('أبيض') || name.includes('ابيض') || name.includes('white')) {
        return { bg: '#ffffff', border: '#cbd5e1', isLight: true };
    }
    if (name.includes('أسود') || name.includes('اسود') || name.includes('black') || name.includes('داكن')) {
        return { bg: '#18181b', isLight: false };
    }
    if (name.includes('أزرق') || name.includes('ازرق') || name.includes('blue') || name.includes('كحلي')) {
        return { bg: '#2563eb', isLight: false };
    }
    if (name.includes('سماوي') || name.includes('آيس') || name.includes('ثلجي')) {
        return { bg: '#38bdf8', isLight: true };
    }
    if (name.includes('أحمر') || name.includes('احمر') || name.includes('red')) {
        return { bg: '#dc2626', isLight: false };
    }
    if (name.includes('وردي') || name.includes('زهري') || name.includes('pink')) {
        return { bg: '#ec4899', isLight: false };
    }
    if (name.includes('ذهبي') || name.includes('صحراوي') || name.includes('gold')) {
        return { bg: '#d4af37', isLight: false };
    }
    if (name.includes('فضي') || name.includes('فضة') || name.includes('silver')) {
        return { bg: '#e2e8f0', border: '#94a3b8', isLight: true };
    }
    if (name.includes('رمادي') || name.includes('تيتانيوم') || name.includes('gray') || name.includes('grey')) {
        return { bg: '#64748b', isLight: false };
    }
    if (name.includes('أخضر') || name.includes('اخضر') || name.includes('green') || name.includes('زيتي')) {
        return { bg: '#16a34a', isLight: false };
    }
    if (name.includes('بنفسجي') || name.includes('أرجواني') || name.includes('purple')) {
        return { bg: '#9333ea', isLight: false };
    }
    if (name.includes('برتقالي') || name.includes('orange')) {
        return { bg: '#f97316', isLight: false };
    }
    if (name.includes('أصفر') || name.includes('اصفر') || name.includes('yellow')) {
        return { bg: '#eab308', isLight: true };
    }
    if (name.includes('بني') || name.includes('brown')) {
        return { bg: '#78350f', isLight: false };
    }

    return { bg: '#334155', isLight: false };
}

function resolveImageUrl(fileId?: string): string {
    if (!fileId || typeof fileId !== 'string' || !fileId.trim()) return '/window.svg';
    if (fileId.startsWith('/') || fileId.startsWith('http://') || fileId.startsWith('https://')) {
        return fileId;
    }
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a79cc3c0029e33756c8';
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'products';
    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${project}`;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const { addToCart } = useCart();
    const { convertPrice, formatPrice } = useCurrency();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isLiked = isInWishlist(product.$id);

    const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
        product.variants && product.variants.length > 0 ? product.variants[0] : undefined
    );
    const [selectedColor, setSelectedColor] = useState<Color | undefined>(
        product.colors && product.colors.length > 0 ? product.colors[0] : undefined
    );
    const [activeImage, setActiveImage] = useState<string>(
        product.mainImageFileId || (product.images && product.images.length > 0 ? resolveImageUrl(product.images[0].fileId) : '/window.svg')
    );
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    // السعر الحالي بناء على النسخة المحددة أو سعر المنتج الأساسي
    const currentPrice = selectedVariant?.price || product.price || 0;
    const phoneNumber = '967771211394';

    const productNameLower = (product.name || '').toLowerCase();
    const categoryName = (typeof product.category === 'object' && product.category?.name) ||
                         (typeof (product as any).categories === 'object' && (product as any).categories?.name) ||
                         (typeof product.category === 'string' ? product.category : '') ||
                         (typeof (product as any).categories === 'string' ? (product as any).categories : '');
    const categorySlug = (typeof product.category === 'object' && product.category?.slug) ||
                         (typeof (product as any).categories === 'object' && (product as any).categories?.slug) || '';

    const catTextLower = `${categoryName} ${categorySlug}`.toLowerCase();
    const fullTextLower = `${productNameLower} ${catTextLower}`;

    // فحص ما إذا كان المنتج ملحقاً أو شاحناً أو جهاز شبكات أو إكسسواراً ليس به سعة تخزينية ورام
    const isAccessoryOrNetworkOrCharger = Boolean(
        fullTextLower.includes('شاحن') ||
        fullTextLower.includes('شواحن') ||
        fullTextLower.includes('شبكة') ||
        fullTextLower.includes('شبكات') ||
        fullTextLower.includes('أجهزة الشبكات') ||
        fullTextLower.includes('راوتر') ||
        fullTextLower.includes('راوترات') ||
        fullTextLower.includes('مودم') ||
        fullTextLower.includes('مودمات') ||
        fullTextLower.includes('مقوي') ||
        fullTextLower.includes('مقويات') ||
        fullTextLower.includes('سويتش') ||
        fullTextLower.includes('سويتشات') ||
        fullTextLower.includes('واي فاي') ||
        fullTextLower.includes('ملحق') ||
        fullTextLower.includes('ملحقات') ||
        fullTextLower.includes('اكسسوار') ||
        fullTextLower.includes('إكسسوار') ||
        fullTextLower.includes('كيبل') ||
        fullTextLower.includes('كابل') ||
        fullTextLower.includes('كوابل') ||
        fullTextLower.includes('كفر') ||
        fullTextLower.includes('كفرات') ||
        fullTextLower.includes('جراب') ||
        fullTextLower.includes('جرابات') ||
        fullTextLower.includes('حماية') ||
        fullTextLower.includes('استيكر') ||
        fullTextLower.includes('باور بنك') ||
        fullTextLower.includes('بنك طاقة') ||
        fullTextLower.includes('سماعة') ||
        fullTextLower.includes('سماعات') ||
        fullTextLower.includes('محول') ||
        fullTextLower.includes('محولات') ||
        fullTextLower.includes('حامل') ||
        fullTextLower.includes('ساعة') ||
        fullTextLower.includes('ساعات') ||
        fullTextLower.includes('charger') ||
        fullTextLower.includes('cable') ||
        fullTextLower.includes('case') ||
        fullTextLower.includes('cover') ||
        fullTextLower.includes('protector') ||
        fullTextLower.includes('powerbank') ||
        fullTextLower.includes('headphone') ||
        fullTextLower.includes('earphone') ||
        fullTextLower.includes('watch') ||
        fullTextLower.includes('adapter') ||
        fullTextLower.includes('router') ||
        fullTextLower.includes('modem') ||
        fullTextLower.includes('network') ||
        fullTextLower.includes('switch') ||
        fullTextLower.includes('wifi') ||
        fullTextLower.includes('access point') ||
        fullTextLower.includes('mesh')
    );

    // دالة لتنظيف وتنسيق اسم النسخة وتجنب ظهور " / " الفارغ
    const getVariantLabel = (v: any) => {
        if (!v) return '';
        const mem = (v.memory || '').trim();
        const ram = (v.ram || '').trim();
        if (mem && ram) return `${mem} / ${ram}`;
        if (mem) return mem;
        if (ram) return ram;
        const nameRaw = (v.name || '').trim();
        const nameClean = nameRaw.replace(/[\s\/]/g, '');
        if (nameClean && nameClean !== 'افتراضي' && nameClean !== 'default' && nameClean !== 'نسخةأساسية') {
            return nameRaw;
        }
        return '';
    };

    // قائمة نسخ السعة التخزينية والرام:
    // لا تظهر إطلاقاً لأجهزة الشبكات أو الشواحن أو الملحقات، وتظهر فقط للأجهزة التي تملك سعة ذاكرة حقيقية
    const storageVariantsList = !isAccessoryOrNetworkOrCharger
        ? (product.variants || []).filter((v) => {
            const mem = (v.memory || '').trim();
            const ram = (v.ram || '').trim();
            return Boolean(mem || ram);
        })
        : [];

    const hasStorageVariants = storageVariantsList.length > 0;

    // النسخ والمواصفات العامة للمنتجات الأخرى (مثل قدرة الشاحن 20W / 35W) تظهر فقط إذا وُجد خياران أو أكثر (> 1) بأسماء حقيقية
    const generalVariantsList = (product.variants || []).filter((v) => {
        const label = getVariantLabel(v);
        return Boolean(label);
    });

    const hasOtherVariants = !hasStorageVariants && generalVariantsList.length > 1;

    // فحص وتصفية الألوان الحقيقية المتاحة للمنتج
    const validColors = (product.colors || []).filter((c) => {
        if (!c || !c.name) return false;
        const nameLower = c.name.trim().toLowerCase();
        return nameLower !== '' &&
               nameLower !== 'افتراضي' &&
               nameLower !== 'افتراضية' &&
               nameLower !== 'default' &&
               nameLower !== 'بدون لون' &&
               nameLower !== 'لا يوجد';
    });

    const hasColors = validColors.length > 0;

    // استخراج وتصفية المواصفات والسمات الأساسية للمنتج (استبعاد أي خاصية فارغة)
    const validKeySpecs: { label: string; value: string }[] = (() => {
        if (!product.keySpecs) return [];
        let specs: any = product.keySpecs;
        if (typeof specs === 'string') {
            try {
                specs = JSON.parse(specs);
            } catch {
                return [];
            }
        }
        if (!Array.isArray(specs)) return [];
        return specs.filter(
            (s: any) =>
                s &&
                typeof s === 'object' &&
                typeof s.label === 'string' &&
                s.label.trim().length > 0 &&
                typeof s.value === 'string' &&
                s.value.trim().length > 0
        ).map((s: any) => ({
            label: s.label.trim(),
            value: s.value.trim()
        }));
    })();

    // التبديل إلى لون وتغيير الصورة المرتبطة به إن وجدت (أو الصورة المقابلة في المعرض)
    const handleColorChange = (c: Color, colorIdx: number) => {
        setSelectedColor(c);

        if (product.images && product.images.length > 0) {
            // 1. البحث أولاً عن صورة مسندة صراحة لهذا اللون
            const matchedImg = product.images.find((img) => {
                if (!img.color) return false;
                if (typeof img.color === 'string') return img.color === c.$id || img.color === c.name;
                if (typeof img.color === 'object') return img.color.$id === c.$id || img.color.name === c.name;
                return false;
            });

            if (matchedImg) {
                setActiveImage(resolveImageUrl(matchedImg.fileId));
            } else if (product.images[colorIdx]) {
                // 2. التبديل إلى الصورة المقابلة لترتيب اللون في المعرض
                setActiveImage(resolveImageUrl(product.images[colorIdx].fileId));
            }
        }
    };

    // الإضافة إلى السلة
    const handleAddToCart = () => {
        const cartItemId = `${product.$id}-${selectedVariant?.$id || 'default'}-${selectedColor?.$id || 'default'}`;

        addToCart({
            id: cartItemId,
            productId: product.$id,
            name: product.name,
            image: activeImage || product.mainImageFileId || '/window.svg',
            price: currentPrice,
            quantity,
            variantId: selectedVariant?.$id,
            variantName: (hasStorageVariants || hasOtherVariants) ? selectedVariant?.name : undefined,
            colorId: hasColors ? selectedColor?.$id : undefined,
            colorName: hasColors ? selectedColor?.name : undefined,
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
    };

    // الطلب المباشر عبر واتساب
    const handleWhatsAppOrder = () => {
        const variantText = selectedVariant && (hasStorageVariants || hasOtherVariants) ? `\n• النسخة/المواصفة: ${selectedVariant.name}${selectedVariant.memory ? ` (${selectedVariant.memory})` : ''}` : '';
        const colorText = selectedColor && hasColors ? `\n• اللون: ${selectedColor.name}` : '';
        
        const totalFormatted = formatPrice(currentPrice * quantity);
        const text = `مرحباً متجر الواسطة، أرغب في طلب المنتج التالي:\n\n` +
                     `*المنتج:* ${product.name}${variantText}${colorText}\n` +
                     `*الكمية:* ${quantity}\n` +
                     `*الإجمالي:* ${totalFormatted}`;

        window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="space-y-10">
            {/* رابط الرجوع */}
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] transition">
                <ArrowRight className="w-4 h-4" />
                العودة لقائمة المنتجات
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

                {/* 1. معرض الصور والـ Thumbnails */}
                <div className="space-y-4">
                    <div className="card relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center p-8 border border-gray-100 shadow-sm rounded-3xl">
                        <Image
                            src={activeImage}
                            alt={product.name}
                            fill
                            priority
                            className="object-contain p-6 transition-all duration-300"
                        />
                    </div>

                    {/* المصغرات (Thumbnails) */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex flex-wrap gap-3 justify-center pt-2">
                            {product.images.map((img, idx) => {
                                const imgUrl = resolveImageUrl(img.fileId);
                                const isCurrent = activeImage === imgUrl;
                                return (
                                    <button
                                        key={img.$id || idx}
                                        type="button"
                                        onClick={() => {
                                            setActiveImage(imgUrl);
                                            if (img.color && product.colors) {
                                                const matchedColor = product.colors.find((c) => {
                                                    if (typeof img.color === 'string') return c.$id === img.color || c.name === img.color;
                                                    if (typeof img.color === 'object') return c.$id === img.color.$id || c.name === img.color.name;
                                                    return false;
                                                });
                                                if (matchedColor) setSelectedColor(matchedColor);
                                            } else if (validColors[idx]) {
                                                setSelectedColor(validColors[idx]);
                                            }
                                        }}
                                        className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 bg-white transition cursor-pointer ${
                                            isCurrent
                                                ? 'border-blue-600 ring-4 ring-blue-50 scale-105 shadow-md'
                                                : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-blue-300'
                                        }`}
                                    >
                                        <Image
                                            src={imgUrl}
                                            alt={img.alt || `${product.name} ${idx + 1}`}
                                            fill
                                            className="object-contain p-1.5"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 2. بيانات وخيارات المنتج */}
                <div className="space-y-6">
                    <div>
                        {/* الشارات وحالة المنتج */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {product.conditionLabel && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                                    product.condition === 'used'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                    <span>{product.condition === 'used' ? '🔄' : '✨'}</span>
                                    <span>الحالة: {product.conditionLabel}</span>
                                </span>
                            )}
                            {typeof product.category === 'object' && product.category?.name && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                    {product.category.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                            {product.name}
                        </h1>
                    </div>

                    {/* السعر المالي */}
                    {(() => {
                        const mainP = convertPrice(currentPrice);
                        const oldP = product.compareAtPrice && product.compareAtPrice > currentPrice ? convertPrice(product.compareAtPrice) : null;
                        return (
                            <div className="flex items-baseline gap-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                                {mainP.code === 'USD' && (
                                    <span className="text-xl font-bold text-gray-500">$</span>
                                )}
                                <span className="text-3xl font-black text-[var(--color-primary)]">
                                    {mainP.formatted}
                                </span>
                                {mainP.code !== 'USD' && (
                                    <span className="text-sm font-bold text-gray-600">{mainP.symbol}</span>
                                )}
                                {oldP && (
                                    <span className="text-base text-gray-400 line-through mr-3">
                                        {oldP.code === 'USD' ? `$${oldP.formatted}` : `${oldP.formatted} ${oldP.symbol}`}
                                    </span>
                                )}
                            </div>
                        );
                    })()}

                    {/* مقتطف سريع لأبرز المواصفات الأساسية */}
                    {validKeySpecs.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {validKeySpecs.slice(0, 4).map((spec, i) => (
                                <div
                                    key={i}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs"
                                >
                                    <span className="text-gray-400 font-normal">{spec.label}:</span>
                                    <span className="text-gray-900 font-extrabold">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* خيارات السعة التخزينية والرام (تظهر فقط إذا كان الجهاز جوال/لوحي وله أكثر من نسخة ذاكرة > 1) */}
                    {hasStorageVariants && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-800 block">اختر السعة / النسخة:</label>
                            <div className="flex flex-wrap gap-2.5">
                                {storageVariantsList.map((v, idx) => (
                                    <button
                                        key={v.$id || idx}
                                        type="button"
                                        onClick={() => setSelectedVariant(v)}
                                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                                            selectedVariant?.name === v.name || selectedVariant?.$id === v.$id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {getVariantLabel(v) || 'النسخة الأساسية'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* خيارات المواصفات والأنواع العامة (للملحقات والشواحن إن وجدت خيارات متعددة > 1) */}
                    {hasOtherVariants && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-800 block">اختر المواصفات / النوع:</label>
                            <div className="flex flex-wrap gap-2.5">
                                {generalVariantsList.map((v, idx) => (
                                    <button
                                        key={v.$id || idx}
                                        type="button"
                                        onClick={() => setSelectedVariant(v)}
                                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                                            selectedVariant?.name === v.name || selectedVariant?.$id === v.$id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {getVariantLabel(v) || v.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* خيارات الألوان المتاحة (تظهر فقط إذا كانت الألوان متوفرة ومحددة للمنتج) */}
                    {hasColors && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-800 block">
                                اللون: <span className="text-blue-600 font-extrabold">{selectedColor?.name}</span>
                            </label>
                            <div className="flex flex-wrap items-center gap-3">
                                {validColors.map((c, idx) => {
                                    const colorStyle = getColorStyle(c.name, c.hexCode);
                                    const isSelected = selectedColor?.name === c.name || selectedColor?.$id === c.$id;

                                    return (
                                        <button
                                            key={c.$id || idx}
                                            type="button"
                                            onClick={() => handleColorChange(c, idx)}
                                            style={{ backgroundColor: colorStyle.bg }}
                                            className={`h-10 px-4 rounded-full border-2 transition flex items-center gap-2 text-xs font-extrabold cursor-pointer shadow-sm ${
                                                colorStyle.border ? 'border-gray-300' : 'border-transparent'
                                            } ${
                                                isSelected
                                                    ? 'ring-2 ring-blue-600 ring-offset-2 scale-105'
                                                    : 'hover:scale-105 opacity-90 hover:opacity-100'
                                            }`}
                                            title={c.name}
                                        >
                                            <span
                                                className="w-4 h-4 rounded-full border border-black/20 shrink-0 flex items-center justify-center"
                                                style={{ backgroundColor: colorStyle.bg }}
                                            >
                                                {isSelected && (
                                                    <Check className={`w-3 h-3 ${colorStyle.isLight ? 'text-gray-900' : 'text-white'}`} />
                                                )}
                                            </span>
                                            <span className={colorStyle.isLight ? 'text-gray-900' : 'text-white'}>
                                                {c.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* تحديد الكمية */}
                    <div className="flex items-center gap-4 pt-2">
                        <span className="text-sm font-bold text-gray-800">الكمية:</span>
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <button
                                type="button"
                                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                className="px-3.5 py-2 hover:bg-gray-100 font-bold"
                            >
                                -
                            </button>
                            <span className="px-4 py-2 text-sm font-bold min-w-[2.5rem] text-center">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="px-3.5 py-2 hover:bg-gray-100 font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className={`btn flex-1 gap-2 py-3.5 transition-all ${
                                isAdded 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'btn-primary'
                            }`}
                        >
                            {isAdded ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>تمت الإضافة للسلة!</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>إضافة إلى السلة</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleWhatsAppOrder}
                            className="btn bg-[#25D366] hover:bg-[#20bd5a] text-white flex-1 gap-2 py-3.5"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>طلب مباشر عبر واتساب</span>
                        </button>

                        {/* زر الإعجاب والمفضلة */}
                        <button
                            type="button"
                            onClick={() => toggleWishlist(product)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                isLiked
                                    ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200'
                            }`}
                            title={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                            aria-label={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        >
                            <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                            <span className="text-xs font-bold sm:hidden">{isLiked ? 'في المفضلة' : 'أعجبني'}</span>
                        </button>
                    </div>

                    {/* تنبيه سريع مع رابط السلة بعد الإضافة */}
                    {isAdded && (
                        <Link
                            href="/cart"
                            className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-bold transition"
                        >
                            <span>عرض محتويات السلة وإتمام الطلب</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}

                    {/* ميزات الشحن والضمان */}
                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-600">
                            <Truck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                            <span>شحن آمن وسريع</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-600">
                            <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                            <span>منتج أصلي مع الضمان</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* 3. المواصفات والسمات الأساسية (تظهر فقط إذا كانت محددة وليست فارغة) */}
            {validKeySpecs.length > 0 && (
                <div className="card p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs border border-blue-100">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                                    المواصفات والسمات الأساسية
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    أهم الخصائص والميزات التقنية المعتمدة للمنتج
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                            {validKeySpecs.length} مواصفات
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {validKeySpecs.map((spec, idx) => (
                            <div
                                key={idx}
                                className="group relative flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 hover:border-blue-200 transition-all duration-200 shadow-2xs hover:shadow-xs"
                            >
                                <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-2xs border border-slate-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                    {getSpecIcon(spec.label)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {/* عنوان الخاصية: بخط هافت قليلاً ومناسب */}
                                    <span className="text-xs font-semibold text-gray-400 block mb-1 truncate">
                                        {spec.label}
                                    </span>
                                    {/* السمة / القيمة: بخط بارز ولون مناسب */}
                                    <span className="text-sm sm:text-base font-black text-gray-900 group-hover:text-blue-700 transition-colors block break-words leading-snug">
                                        {spec.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. تفاصيل ومواصفات المنتج الكاملة */}
            {product.description && (
                <div className="card p-6 sm:p-8 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                        تفاصيل ومواصفات المنتج الكاملة
                    </h2>
                    <div className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                        {product.description}
                    </div>
                </div>
            )}
        </div>
    );
}