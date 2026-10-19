// app/products/[id]/page.tsx
import { getProductById } from '@/lib/appwrite/api';
import ProductDetails from './ProductDetails';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-blue-600 transition">المنتجات</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <ProductDetails product={product} />
    </div>
  );
}