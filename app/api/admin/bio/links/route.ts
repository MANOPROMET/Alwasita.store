// app/api/admin/bio/links/route.ts
import { NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { optimizeImage } from '@/lib/imageOptimizer';
import { getBioLinks } from '@/lib/appwrite/api';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'products';

// 1. جلب كافة الروابط للأدمن
export async function GET() {
  try {
    const links = await getBioLinks(true);
    return NextResponse.json({ success: true, links });
  } catch (error: any) {
    console.error('Error fetching admin bio links:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الروابط' },
      { status: 500 }
    );
  }
}

// 2. إضافة رابط جديد
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let title = '';
    let subtitle = '';
    let url = '';
    let icon = 'external-link';
    let isActive = true;
    let isHighlighted = false;
    let sortOrder = 0;
    let iconImageFileId = '';
    let uploadedFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || '';
      subtitle = (formData.get('subtitle') as string) || '';
      url = (formData.get('url') as string) || '';
      icon = (formData.get('icon') as string) || 'external-link';
      isActive = formData.get('isActive') !== 'false';
      isHighlighted = formData.get('isHighlighted') === 'true';
      sortOrder = Number(formData.get('sortOrder')) || 0;
      iconImageFileId = (formData.get('iconImageFileId') as string) || '';

      const file = formData.get('iconImage') as File | null;
      if (file && typeof file === 'object' && 'arrayBuffer' in file && file.size > 0) {
        uploadedFile = file;
      }
    } else {
      const body = await request.json();
      title = body.title || '';
      subtitle = body.subtitle || '';
      url = body.url || '';
      icon = body.icon || 'external-link';
      isActive = body.isActive !== false;
      isHighlighted = Boolean(body.isHighlighted);
      sortOrder = Number(body.sortOrder) || 0;
      iconImageFileId = body.iconImageFileId || '';
    }

    if (!title.trim() || !url.trim()) {
      return NextResponse.json(
        { error: 'عنوان الرابط ورابط الوجهة مطلوبان' },
        { status: 400 }
      );
    }

    // إذا تم رفع أيقونة/صورة مخصصة للزر
    if (uploadedFile) {
      try {
        const rawBuffer = Buffer.from(await uploadedFile.arrayBuffer());
        const optimized = await optimizeImage(rawBuffer, uploadedFile.name || 'link-icon.jpg', {
          maxWidth: 200,
          maxHeight: 200,
          quality: 90,
          format: 'webp',
        });
        const inputFile = InputFile.fromBuffer(optimized.buffer, optimized.fileName);
        const stored = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
        iconImageFileId = stored.$id;
      } catch (uploadErr) {
        console.warn('Icon image upload error:', uploadErr);
      }
    }

    const payload: any = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      url: url.trim(),
      icon: icon || 'external-link',
      isActive: Boolean(isActive),
      isHighlighted: Boolean(isHighlighted),
      sortOrder: Math.floor(sortOrder),
      clicks: 0,
    };

    if (iconImageFileId) {
      payload.iconImageFileId = iconImageFileId;
    }

    const doc = await databases.createDocument(DATABASE_ID, 'bio_links', ID.unique(), payload);
    return NextResponse.json({ success: true, link: doc });
  } catch (error: any) {
    console.error('Error creating bio link:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إضافة الرابط' },
      { status: 500 }
    );
  }
}

// 3. تعديل رابط قائم
export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let id = '';
    let title = '';
    let subtitle = '';
    let url = '';
    let icon = 'external-link';
    let isActive = true;
    let isHighlighted = false;
    let sortOrder = 0;
    let iconImageFileId = '';
    let uploadedFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      id = (formData.get('id') as string) || '';
      title = (formData.get('title') as string) || '';
      subtitle = (formData.get('subtitle') as string) || '';
      url = (formData.get('url') as string) || '';
      icon = (formData.get('icon') as string) || 'external-link';
      isActive = formData.get('isActive') !== 'false';
      isHighlighted = formData.get('isHighlighted') === 'true';
      sortOrder = Number(formData.get('sortOrder')) || 0;
      iconImageFileId = (formData.get('iconImageFileId') as string) || '';

      const file = formData.get('iconImage') as File | null;
      if (file && typeof file === 'object' && 'arrayBuffer' in file && file.size > 0) {
        uploadedFile = file;
      }
    } else {
      const body = await request.json();
      id = body.id || '';
      title = body.title || '';
      subtitle = body.subtitle || '';
      url = body.url || '';
      icon = body.icon || 'external-link';
      isActive = body.isActive !== false;
      isHighlighted = Boolean(body.isHighlighted);
      sortOrder = Number(body.sortOrder) || 0;
      iconImageFileId = body.iconImageFileId || '';
    }

    if (!id) {
      return NextResponse.json({ error: 'معرف الرابط مطلوب' }, { status: 400 });
    }

    if (!title.trim() || !url.trim()) {
      return NextResponse.json(
        { error: 'عنوان الرابط ورابط الوجهة مطلوبان' },
        { status: 400 }
      );
    }

    if (uploadedFile) {
      try {
        const rawBuffer = Buffer.from(await uploadedFile.arrayBuffer());
        const optimized = await optimizeImage(rawBuffer, uploadedFile.name || 'link-icon.jpg', {
          maxWidth: 200,
          maxHeight: 200,
          quality: 90,
          format: 'webp',
        });
        const inputFile = InputFile.fromBuffer(optimized.buffer, optimized.fileName);
        const stored = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
        iconImageFileId = stored.$id;
      } catch (uploadErr) {
        console.warn('Icon image upload error:', uploadErr);
      }
    }

    const payload: any = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      url: url.trim(),
      icon: icon || 'external-link',
      isActive: Boolean(isActive),
      isHighlighted: Boolean(isHighlighted),
      sortOrder: Math.floor(sortOrder),
    };

    if (iconImageFileId !== undefined) {
      payload.iconImageFileId = iconImageFileId;
    }

    const doc = await databases.updateDocument(DATABASE_ID, 'bio_links', id, payload);
    return NextResponse.json({ success: true, link: doc });
  } catch (error: any) {
    console.error('Error updating bio link:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تعديل الرابط' },
      { status: 500 }
    );
  }
}

// 4. حذف رابط
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف الرابط مطلوب' }, { status: 400 });
    }

    // حذف الأيقونة المرفوعة إن وُجدت
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'bio_links', id);
      if (doc.iconImageFileId) {
        try {
          await storage.deleteFile(BUCKET_ID, doc.iconImageFileId);
        } catch {}
      }
    } catch {}

    await databases.deleteDocument(DATABASE_ID, 'bio_links', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bio link:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الرابط' },
      { status: 500 }
    );
  }
}
