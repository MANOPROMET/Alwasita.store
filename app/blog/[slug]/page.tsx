import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPosts, getProductById, getProductImageUrl } from '@/lib/appwrite/api';
import { Product } from '@/types';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ArrowRight,
  MessageCircle,
  Cpu,
  Smartphone,
  BatteryCharging,
  Camera,
  HardDrive,
  Wifi,
  Sparkles,
  Tag,
  CheckCircle2,
  Share2,
  ShoppingCart,
} from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ParsedSpecs {
  specs: { label: string; value: string; iconKey: string }[];
  description: string;
}

function parseSpecsContent(content: string): ParsedSpecs | null {
  if (!content) return null;
  const startIdx = content.indexOf('[SPECS_START]');
  const endIdx = content.indexOf('[SPECS_END]');

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  const specsBlock = content.slice(startIdx + '[SPECS_START]'.length, endIdx).trim();
  const description = (content.slice(0, startIdx) + '\n' + content.slice(endIdx + '[SPECS_END]'.length)).trim();

  const lines = specsBlock.split('\n').map((l) => l.trim()).filter(Boolean);
  const specs: { label: string; value: string; iconKey: string }[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const label = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      let iconKey = 'generic';
      if (label.includes('معالج') || label.includes('أداء') || label.includes('CPU')) iconKey = 'cpu';
      else if (label.includes('شاشة') || label.includes('عرض') || label.includes('Screen')) iconKey = 'screen';
      else if (label.includes('بطارية') || label.includes('شحن') || label.includes('Battery')) iconKey = 'battery';
      else if (label.includes('كاميرا') || label.includes('تصوير') || label.includes('Camera')) iconKey = 'camera';
      else if (label.includes('ذاكرة') || label.includes('رام') || label.includes('RAM') || label.includes('تخزين')) iconKey = 'storage';
      else if (label.includes('شبك') || label.includes('اتصال') || label.includes('Wi-Fi') || label.includes('5G')) iconKey = 'wifi';
      else if (label.includes('ميز') || label.includes('مزايا') || label.includes('Features')) iconKey = 'features';
      else if (label.includes('سعر') || label.includes('Price')) iconKey = 'price';

      specs.push({ label, value, iconKey });
    }
  }

  return { specs, description };
}

function getSpecIcon(iconKey: string) {
  switch (iconKey) {
    case 'cpu':
      return <Cpu className="w-5 h-5 text-purple-600" />;
    case 'screen':
      return <Smartphone className="w-5 h-5 text-blue-600" />;
    case 'battery':
      return <BatteryCharging className="w-5 h-5 text-emerald-600" />;
    case 'camera':
      return <Camera className="w-5 h-5 text-rose-600" />;
    case 'storage':
      return <HardDrive className="w-5 h-5 text-amber-600" />;
    case 'wifi':
      return <Wifi className="w-5 h-5 text-cyan-600" />;
    case 'features':
      return <Sparkles className="w-5 h-5 text-indigo-600" />;
    case 'price':
      return <Tag className="w-5 h-5 text-emerald-600" />;
    default:
      return <CheckCircle2 className="w-5 h-5 text-gray-500" />;
  }
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}

  const post = await getBlogPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  // فحص توفر المنتج برمجياً عبر productId أو product_id
  const linkedProductId = post.productId || post.product_id;
  let linkedProduct: Product | null = null;
  if (linkedProductId) {
    linkedProduct = await getProductById(linkedProductId);
  }
  const isProductAvailable = Boolean(linkedProduct && linkedProduct.isActive !== false);

  const allPosts = await getBlogPosts({ limit: 4 });
  const relatedPosts = allPosts.filter((p) => p.$id !== post.$id).slice(0, 3);

  const imageSrc = post.image?.startsWith('/') || post.image?.startsWith('http')
    ? post.image
    : post.image
    ? getProductImageUrl(post.image)
    : '/whyP.jpeg';

  const postDate = post.$createdAt
    ? new Date(post.$createdAt).toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'حديث';

  const isSpecArticle = Boolean(post.category?.startsWith('مواصفات:'));
  const parsedSpecs = parseSpecsContent(post.content || '');

  const whatsappInquiryUrl = `https://wa.me/967771211394?text=${encodeURIComponent(
    `مرحباً متجر الواسطة، أرغب بالاستفسار عن توفر وسعر الجهاز: ${post.title}`
  )}`;

  const displayParagraphs = (parsedSpecs ? parsedSpecs.description : post.content)
    .split('\n')
    .filter((p) => p.trim() !== '');

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      
      {/* 1. مسار التصفح (Breadcrumb) */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/blog" className="hover:text-[var(--color-primary)] transition">
              {isSpecArticle ? 'مواصفات الأجهزة' : 'المدونة'}
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* رأس المقال */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="font-bold text-[var(--color-primary)] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              {post.category || 'عام'}
            </span>
            {isSpecArticle && (
              <span className="font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                ⚡ بطاقة مواصفات تقنية
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {postDate}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime || '3 دقائق'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-gray-200/80">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* صورة الجهاز أو الغلاف */}
        <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-zinc-900 shadow-md">
          <Image
            src={imageSrc}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* بطاقات وجدول المواصفات التقنية الفائقة */}
        {parsedSpecs && parsedSpecs.specs.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                  <h2 className="text-lg sm:text-xl font-black text-gray-900">
                    جدول المواصفات التقنية للجهاز
                  </h2>
                </div>
                <p className="text-xs text-gray-500">
                  المواصفات الفنية المعتمدة للأداء، الشاشة، البطارية والكاميرات
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isProductAvailable && (
                  <Link
                    href={`/products/${linkedProduct!.$id}`}
                    className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>طلب المنتج الآن</span>
                  </Link>
                )}
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>طلب الجهاز واتساب</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parsedSpecs.specs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-gray-200/80 hover:border-purple-200 hover:bg-purple-50/10 transition flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 shadow-2xs">
                    {getSpecIcon(item.iconKey)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-xs font-bold text-gray-400 block">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-snug">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* مراجعة الجهاز أو تفاصيل المحتوى */}
        {displayParagraphs.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-6 text-gray-800 text-sm sm:text-base leading-loose">
            {isSpecArticle && (
              <h3 className="text-base sm:text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                المراجعة التفصيلية وتجربة الاستخدام
              </h3>
            )}
            {displayParagraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        )}

        {/* بطاقة الدعوة للإجراء (Bottom CTA Bar لتحويل القارئ إلى مشتري) */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-purple-800/40">
          <div className="space-y-1.5 text-center sm:text-right">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isProductAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-purple-300'}`} />
              <h4 className="text-base sm:text-xl font-black">
                {isProductAvailable
                  ? `هذا المنتج متوفر للشراء المباشر الآن في المتجر!`
                  : `أعجبك هذا الجهاز وتريد طلبه أو الاستفسار عنه؟`}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              {isProductAvailable
                ? `يمكنك شراء الجهاز فوراً من المتجر مع التوصيل السريع وضمان الجودة، أو الاستفسار عبر واتساب.`
                : `تواصل مباشرة مع خدمة عملاء متجر الواسطة لمعرفة السعر الحالي وتأكيد التوفر والشحن.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center sm:justify-end">
            {isProductAvailable ? (
              <>
                <Link
                  href={`/products/${linkedProduct!.$id}`}
                  className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-black rounded-2xl transition flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-purple-400/40"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>طلب المنتج الآن</span>
                </Link>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-2xl transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>استفسر عنه عبر واتساب</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-2xl transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>استفسر عنه عبر واتساب</span>
                </a>

                <Link
                  href="/products"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-2xl transition border border-white/10"
                >
                  المتجر
                </Link>
              </>
            )}
          </div>
        </div>

        {/* مقالات أو أجهزة ذات صلة */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-gray-200/80">
            <h3 className="text-lg font-black text-gray-900">أجهزة ومقالات أخرى قد تهمك</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((related) => {
                const relImg = related.image?.startsWith('/') || related.image?.startsWith('http')
                  ? related.image
                  : related.image
                  ? getProductImageUrl(related.image)
                  : '/whyP.jpeg';

                return (
                  <Link
                    key={related.$id}
                    href={`/blog/${encodeURIComponent(related.slug || related.$id)}`}
                    className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-3 hover:border-purple-300 transition group"
                  >
                    <div className="relative w-full h-32 rounded-xl bg-gray-100 overflow-hidden">
                      <Image
                        src={relImg}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-[var(--color-primary)]">
                      {related.title}
                    </h4>
                    <span className="text-[11px] text-gray-400 block">
                      {related.readTime || '3 دقائق'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </article>

    </div>
  );
}
