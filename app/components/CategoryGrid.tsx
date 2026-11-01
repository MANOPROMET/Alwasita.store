'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
}

function getCategoryImage(name: string): { image: string; isFallback: boolean } {
  const n = (name || '').toLowerCase();

  if (n.includes('هاتف') || n.includes('هواتف') || n.includes('جوال') || n.includes('جوالات') || n.includes('smartphones') || n.includes('mobile')) {
    return { image: '/phoneP.jpeg', isFallback: false };
  }
  if (n.includes('ملحق') || n.includes('ملحقات') || n.includes('شواحن') || n.includes('شاحن') || n.includes('accessories')) {
    return { image: '/AccessoriesP.jpeg', isFallback: false };
  }
  if (n.includes('لوحي') || n.includes('تابلت') || n.includes('ايباد') || n.includes('tablet')) {
    return { image: '/TabletP.jpeg', isFallback: false };
  }
  if (n.includes('شبك') || n.includes('راوتر') || n.includes('روتر') || n.includes('مودم') || n.includes('network')) {
    return { image: '/Network_devicesP.jpeg', isFallback: false };
  }

  // تنبيه في حال وجود قسم ليس له صورة مخصصة في مجلد public
  if (typeof window !== 'undefined') {
    console.warn(`[CategoryGrid] تنبيه: لا توجد صورة مخصصة للقسم "${name}" في مجلد public، تم استخدام phoneP.jpeg كصورة بديلة مؤقتة.`);
  }

  return { image: '/phoneP.jpeg', isFallback: true };
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* عنوان مكتوب فيه الأقسام الرئيسية ومعه خط بارز */}
      <div className="border-b border-gray-200/80 pb-3">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--color-primary)] tracking-tight">
          الأقسام الرئيسية
        </h3>
      </div>

      {/* شبكة الأقسام مع الصور الحقيقية من مجلد public */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const { image } = getCategoryImage(cat.name);

          return (
            <Link
              key={cat.$id}
              href={`/products?category=${cat.slug || cat.$id}`}
              className="group relative h-36 sm:h-44 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 p-5 flex flex-col justify-end transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-lg transform hover:-translate-y-1"
            >
              {/* صورة القسم كخلفية */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                {/* طبقة حماية لونية خفيفة لتوضيح اسم القسم */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              </div>

              {/* اسم القسم فقط في الأسفل بخط عريض واضح بدون كلمة قسم */}
              <div className="relative z-10">
                <h4 className="text-base sm:text-lg md:text-xl font-black text-white drop-shadow-md group-hover:text-purple-300 transition-colors">
                  {cat.name}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
