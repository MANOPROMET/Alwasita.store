import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

// 1. جلب كافة الفئات مع عدد المنتجات التابعة لها
export async function GET() {
  try {
    const [catsRes, productsRes] = await Promise.all([
      databases.listDocuments(DATABASE_ID, 'categories', [Query.orderAsc('sortOrder')]),
      databases.listDocuments(DATABASE_ID, 'products', [Query.limit(100)]),
    ]);

    const categories = catsRes.documents;
    const products = productsRes.documents;

    // احتساب عدد المنتجات في كل قسم
    const categoriesWithCount = categories.map((cat) => {
      const count = products.filter((p: any) => {
        const catField = p.categories || p.category;
        if (!catField) return false;
        if (typeof catField === 'string') return catField === cat.$id || catField === cat.slug;
        if (Array.isArray(catField)) {
          return catField.some((c: any) =>
            typeof c === 'string' ? c === cat.$id || c === cat.slug : c?.$id === cat.$id
          );
        }
        return catField?.$id === cat.$id;
      }).length;

      return {
        ...cat,
        productCount: count,
      };
    });

    return NextResponse.json({ success: true, categories: categoriesWithCount });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الأقسام' },
      { status: 500 }
    );
  }
}

// 2. إنشاء فئة جديدة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, sortOrder, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم القسم مطلوب' }, { status: 400 });
    }

    const cleanSlug =
      slug?.trim() ||
      name
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '') ||
      `category-${Date.now()}`;

    const newDoc = await databases.createDocument(
      DATABASE_ID,
      'categories',
      ID.unique(),
      {
        name: name.trim(),
        slug: cleanSlug,
        sortOrder: Number(sortOrder) || 1,
        isActive: isActive !== false,
      }
    );

    return NextResponse.json({ success: true, category: newDoc });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء القسم' },
      { status: 500 }
    );
  }
}

// 3. تعديل فئة موجودة
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف القسم مطلوب' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (name) updatePayload.name = name.trim();
    if (slug) updatePayload.slug = slug.trim();
    if (sortOrder !== undefined) updatePayload.sortOrder = Number(sortOrder);
    if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);

    const updated = await databases.updateDocument(
      DATABASE_ID,
      'categories',
      id,
      updatePayload
    );

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث القسم' },
      { status: 500 }
    );
  }
}

// 4. حذف فئة
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف القسم مطلوب' }, { status: 400 });
    }

    await databases.deleteDocument(DATABASE_ID, 'categories', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف القسم' },
      { status: 500 }
    );
  }
}
