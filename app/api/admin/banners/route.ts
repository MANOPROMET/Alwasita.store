import { NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { optimizeImage } from '@/lib/imageOptimizer';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'products';

// 1. جلب كافة البنرات مع إمكانية التصفية حسب النوع
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'hero' | 'promo'

    const queries = [Query.orderAsc('sortOrder')];
    if (type) {
      queries.push(Query.equal('bannerType', type));
    }

    const res = await databases.listDocuments(DATABASE_ID, 'banners', queries);
    return NextResponse.json({ success: true, banners: res.documents });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب البنرات' },
      { status: 500 }
    );
  }
}

// 2. إنشاء بنر جديد
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = (formData.get('title') as string) || '';
    const subtitle = (formData.get('subtitle') as string) || '';
    const bannerType = (formData.get('bannerType') as string) || 'hero';
    const productId = (formData.get('productId') as string) || '';
    const rawLinkType = (formData.get('linkType') as string) || (productId ? 'product' : 'url');
    let linkType = rawLinkType === 'custom' ? 'url' : rawLinkType;
    if (!['url', 'category', 'product', 'none'].includes(linkType)) {
      linkType = productId ? 'product' : 'url';
    }
    const linkValue = (formData.get('linkValue') as string) || (productId ? `/products/${productId}` : '/products');
    const sortOrder = Number(formData.get('sortOrder')) || 0;
    const isActive = formData.get('isActive') !== 'false';
    const file = formData.get('image') as File | null;
    let imageFileId = (formData.get('imageFileId') as string) || '';

    if (!title.trim()) {
      return NextResponse.json({ error: 'عنوان البنر مطلوب' }, { status: 400 });
    }

    // إذا تم رفع ملف صورة جديدة، نقوم بضغطها وتعديل مقاساتها بذكاء
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const optimized = await optimizeImage(rawBuffer, file.name || 'banner.jpg', {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 82,
        format: 'webp',
      });
      const inputFile = InputFile.fromBuffer(optimized.buffer, optimized.fileName);
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
      imageFileId = uploadedFile.$id;
    }

    if (!imageFileId) {
      return NextResponse.json({ error: 'صورة البنر مطلوبة' }, { status: 400 });
    }

    const bannerDoc = await databases.createDocument(
      DATABASE_ID,
      'banners',
      ID.unique(),
      {
        title: title.trim(),
        subtitle: subtitle.trim(),
        bannerType,
        productId: productId.trim(),
        imageFileId: imageFileId.trim(),
        linkType,
        linkValue: linkValue.trim(),
        sortOrder,
        isActive,
      }
    );

    return NextResponse.json({ success: true, banner: bannerDoc });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء البنر' },
      { status: 500 }
    );
  }
}

// 3. تعديل بنر (سواء عبر JSON أو FormData)
export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let id = '';
    let payload: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      id = (formData.get('id') as string) || '';
      if (!id) {
        return NextResponse.json({ error: 'معرف البنر مطلوب' }, { status: 400 });
      }

      if (formData.has('title')) payload.title = (formData.get('title') as string).trim();
      if (formData.has('subtitle')) payload.subtitle = (formData.get('subtitle') as string).trim();
      if (formData.has('bannerType')) payload.bannerType = formData.get('bannerType') as string;
      if (formData.has('productId')) payload.productId = (formData.get('productId') as string).trim();
      if (formData.has('linkType')) {
        let lt = formData.get('linkType') as string;
        if (lt === 'custom') lt = 'url';
        if (!['url', 'category', 'product', 'none'].includes(lt)) lt = 'url';
        payload.linkType = lt;
      }
      if (formData.has('linkValue')) payload.linkValue = (formData.get('linkValue') as string).trim();
      if (formData.has('sortOrder')) payload.sortOrder = Number(formData.get('sortOrder'));
      if (formData.has('isActive')) payload.isActive = formData.get('isActive') !== 'false';

      // فحص هل رُفعت صورة جديدة وضغطها
      const file = formData.get('image') as File | null;
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const optimized = await optimizeImage(rawBuffer, file.name || 'banner.jpg', {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 82,
          format: 'webp',
        });
        const inputFile = InputFile.fromBuffer(optimized.buffer, optimized.fileName);
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
        payload.imageFileId = uploadedFile.$id;
      } else if (formData.has('imageFileId') && formData.get('imageFileId')) {
        payload.imageFileId = (formData.get('imageFileId') as string).trim();
      }
    } else {
      const body = await request.json();
      id = body.id;
      if (!id) {
        return NextResponse.json({ error: 'معرف البنر مطلوب' }, { status: 400 });
      }

      if (body.title !== undefined) payload.title = body.title.trim();
      if (body.subtitle !== undefined) payload.subtitle = body.subtitle.trim();
      if (body.bannerType !== undefined) payload.bannerType = body.bannerType;
      if (body.productId !== undefined) payload.productId = body.productId?.trim() || '';
      if (body.imageFileId !== undefined) payload.imageFileId = body.imageFileId?.trim() || '';
      if (body.linkType !== undefined) {
        let lt = body.linkType;
        if (lt === 'custom') lt = 'url';
        if (!['url', 'category', 'product', 'none'].includes(lt)) lt = 'url';
        payload.linkType = lt;
      }
      if (body.linkValue !== undefined) payload.linkValue = body.linkValue?.trim() || '';
      if (body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder);
      if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);
    }

    const updated = await databases.updateDocument(DATABASE_ID, 'banners', id, payload);
    return NextResponse.json({ success: true, banner: updated });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تعديل البنر' },
      { status: 500 }
    );
  }
}

// 4. حذف بنر
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف البنر مطلوب' }, { status: 400 });
    }

    await databases.deleteDocument(DATABASE_ID, 'banners', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف البنر' },
      { status: 500 }
    );
  }
}
