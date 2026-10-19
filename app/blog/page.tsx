import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts, getProductImageUrl } from '@/lib/appwrite/api';
import { BlogPost } from '@/types';
import BlogClientView from './BlogClientView';
import { ChevronLeft, Sparkles } from 'lucide-react';

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      
      {/* 1. مسار التصفح (Breadcrumb) */}
      <div className="bg-white border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">المدونة التقنية</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* رأس الصفحة مع شارة أنيقة */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[var(--color-primary)] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مدونة متجر الواسطة</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            أحدث المقالات والإرشادات التقنية
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            مقالات مختارة بعناية لمساعدتك في اختيار أفضل الأجهزة، الحفاظ على استثمارك، والتعرف على جديد التكنولوجيا.
          </p>
        </div>

        {/* العرض التفاعلي للعملاء مع الفلترة والبحث */}
        <BlogClientView initialPosts={posts} />

      </div>
    </div>
  );
}
