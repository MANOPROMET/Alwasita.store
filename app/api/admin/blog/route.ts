import { NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { getBlogPosts } from '@/lib/appwrite/api';
import { optimizeImage } from '@/lib/imageOptimizer';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'products';

// 1. جلب كافة المقالات للأدمن
export async function GET() {
  try {
    const posts = await getBlogPosts({ includeInactive: true });
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('API Error fetching blog posts:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب مقالات المدونة' },
      { status: 500 }
    );
  }
}

// 2. إنشاء مقال جديد
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = (formData.get('title') as string) || '';
    const slugRaw = (formData.get('slug') as string) || '';
    const excerpt = (formData.get('excerpt') as string) || '';
    const content = (formData.get('content') as string) || '';
    const category = (formData.get('category') as string) || 'عام';
    const readTime = (formData.get('readTime') as string) || '3 دقائق';
    const isActive = formData.get('isActive') !== 'false';
    const isFeatured = formData.get('isFeatured') === 'true';

    if (!title.trim()) {
      return NextResponse.json({ error: 'عنوان المقال مطلوب' }, { status: 400 });
    }

    const postId = ID.unique();
    const slug =
      slugRaw.trim() ||
      title
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '') || `post-${postId}`;

    let imageUrl = (formData.get('imageUrl') as string) || '';

    // ضغط ورفع صورة الغلاف إن وُجدت
    const file = formData.get('image') as File | null;
    if (file && typeof file === 'object' && 'arrayBuffer' in file && file.size > 0) {
      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const optimized = await optimizeImage(rawBuffer, file.name || `blog-${postId}.jpg`, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 80,
        format: 'webp',
      });
      const inputFile = InputFile.fromBuffer(optimized.buffer, optimized.fileName);
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
      imageUrl = uploadedFile.$id;
    }

    const productIdRaw =
      (formData.get('product_id') as string) || (formData.get('productId') as string) || '';

    const payload: any = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category.trim(),
      readTime: readTime.trim(),
      image: imageUrl.trim() || '/whyP.jpeg',
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
      viewsCount: 0,
    };

    if (productIdRaw.trim()) {
      payload.product_id = productIdRaw.trim();
      payload.productId = productIdRaw.trim();
    }

    const doc = await databases.createDocument(DATABASE_ID, 'blog_posts', postId, payload);

    return NextResponse.json({ success: true, post: doc });
  } catch (error: any) {
    console.error('API Error creating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ المقال' },
      { status: 500 }
    );
  }
}

// 3. تعديل مقال قائم
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return NextResponse.json({ error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    const title = (formData.get('title') as string) || '';
    const slugRaw = (formData.get('slug') as string) || '';
    const excerpt = (formData.get('excerpt') as string) || '';
    const content = (formData.get('content') as string) || '';
    const category = (formData.get('category') as string) || '';
    const readTime = (formData.get('readTime') as string) || '';
    const isActive = formData.get('isActive') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const productIdRaw =
      (formData.get('product_id') as string) ?? (formData.get('productId') as string);

    if (!title.trim()) {
      return NextResponse.json({ error: 'عنوان المقال مطلوب' }, { status: 400 });
    }

    const payload: any = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category.trim(),
      readTime: readTime.trim(),
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
    };

    if (slugRaw.trim()) {
      payload.slug = slugRaw.trim();
    }

    if (productIdRaw !== null && productIdRaw !== undefined) {
      payload.product_id = productIdRaw.trim() || null;
      payload.productId = productIdRaw.trim() || null;
    }

    let imageUrl = (formData.get('imageUrl') as string) || '';

    // ضغط ورفع صورة جديدة إذا تم اختيارها
    const file = formData.get('image') as File | null;
    if (file && typeof file === 'object' && 'arrayBuffer' in file && file.size > 0) {
      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const optimized = await optimizeImage(rawBuffer, file.name || `blog-${id}.jpg`, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 80,
        format: 'webp',
      });
      const inputFile = InputFile.fromBuffer(optimized.buffer, optimized.fileName);
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
      payload.image = uploadedFile.$id;
    } else if (imageUrl.trim()) {
      payload.image = imageUrl.trim();
    }

    const doc = await databases.updateDocument(DATABASE_ID, 'blog_posts', id, payload);

    return NextResponse.json({ success: true, post: doc });
  } catch (error: any) {
    console.error('API Error updating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تعديل المقال' },
      { status: 500 }
    );
  }
}

// 4. تبديل سريع للحالة
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive, isFeatured } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    const payload: any = {};
    if (isActive !== undefined) payload.isActive = Boolean(isActive);
    if (isFeatured !== undefined) payload.isFeatured = Boolean(isFeatured);

    const doc = await databases.updateDocument(DATABASE_ID, 'blog_posts', id, payload);

    return NextResponse.json({ success: true, post: doc });
  } catch (error: any) {
    console.error('API Error updating blog post status:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث حالة المقال' },
      { status: 500 }
    );
  }
}

// 5. حذف مقال
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    await databases.deleteDocument(DATABASE_ID, 'blog_posts', id);

    return NextResponse.json({ success: true, message: 'تم حذف المقال بنجاح' });
  } catch (error: any) {
    console.error('API Error deleting blog post:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف المقال' },
      { status: 500 }
    );
  }
}
