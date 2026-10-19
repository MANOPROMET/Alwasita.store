import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById, getCategories } from '@/lib/appwrite/api';
import { ArrowRight } from 'lucide-react';
import EditProductForm from './EditProductForm';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لإدارة المنتجات</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            تعديل المنتج: {product.name}
          </h1>
          <p className="text-xs text-gray-400 font-mono">ID: {product.$id}</p>
        </div>
      </div>

      <EditProductForm initialProduct={product} categories={categories} />
    </div>
  );
}
