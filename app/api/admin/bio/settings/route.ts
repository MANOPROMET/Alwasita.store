// app/api/admin/bio/settings/route.ts
import { NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { optimizeImage } from '@/lib/imageOptimizer';
import { getBioSettings } from '@/lib/appwrite/api';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'products';

export async function GET() {
  try {
    const settings = await getBioSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching admin bio settings:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب إعدادات صفحة الروابط' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let title = '';
    let bio = '';
    let theme = 'beacons-dark';
    let customBg = '';
    let buttonStyle = 'glass-dark';
    let socialLinksRaw = '{}';
    let showQrModal = true;
    let footerText = '';
    let avatarFileId = '';
    let uploadedFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || '';
      bio = (formData.get('bio') as string) || '';
      theme = (formData.get('theme') as string) || 'beacons-dark';
      customBg = (formData.get('customBg') as string) || '';
      buttonStyle = (formData.get('buttonStyle') as string) || 'glass-dark';
      socialLinksRaw = (formData.get('socialLinks') as string) || '{}';
      showQrModal = formData.get('showQrModal') !== 'false';
      footerText = (formData.get('footerText') as string) || '';
      avatarFileId = (formData.get('avatarFileId') as string) || '';

      const file = formData.get('avatar') as File | null;
      if (file && typeof file === 'object' && 'arrayBuffer' in file && file.size > 0) {
        uploadedFile = file;
      }
    } else {
      const body = await request.json();
      title = body.title || '';
      bio = body.bio || '';
      theme = body.theme || 'beacons-dark';
      customBg = body.customBg || '';
      buttonStyle = body.buttonStyle || 'glass-dark';
      socialLinksRaw = typeof body.socialLinks === 'object' ? JSON.stringify(body.socialLinks) : (body.socialLinks || '{}');
      showQrModal = body.showQrModal !== false;
      footerText = body.footerText || '';
      avatarFileId = body.avatarFileId || '';
    }

    // إذا تم رفع صورة شعار جديدة، نضغطها ونرفعها للتخزين
    if (uploadedFile) {
      try {
        const rawBuffer = Buffer.from(await uploadedFile.arrayBuffer());
        const optimized = await optimizeImage(rawBuffer, uploadedFile.name || 'avatar.jpg', {
          maxWidth: 400,
          maxHeight: 400,
          quality: 85,
          format: 'webp',
        });
        const inputFile = InputFile.fromBuffer(optimized.buffer, optimized.fileName);
        const stored = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
        avatarFileId = stored.$id;
      } catch (uploadErr) {
        console.warn('Avatar optimization/upload fallback:', uploadErr);
      }
    }

    // فحص ما إذا كان هناك مستند مسبق في bio_settings
    const listRes = await databases.listDocuments(DATABASE_ID, 'bio_settings', [Query.limit(1)]);

    const payload: any = {
      title: title.trim() || 'متجر الواسطة',
      bio: bio.trim(),
      theme: theme || 'beacons-dark',
      customBg: customBg.trim(),
      buttonStyle: buttonStyle || 'glass-dark',
      socialLinks: socialLinksRaw,
      showQrModal: Boolean(showQrModal),
      footerText: footerText.trim() || 'متجر الواسطة © جميع الحقوق محفوظة',
    };

    if (avatarFileId !== undefined) {
      payload.avatarFileId = avatarFileId;
    }

    let updatedDoc;
    if (listRes.documents.length > 0) {
      const docId = listRes.documents[0].$id;
      updatedDoc = await databases.updateDocument(DATABASE_ID, 'bio_settings', docId, payload);
    } else {
      updatedDoc = await databases.createDocument(DATABASE_ID, 'bio_settings', 'main_settings', payload);
    }

    return NextResponse.json({ success: true, settings: updatedDoc });
  } catch (error: any) {
    console.error('Error updating bio settings:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ إعدادات صفحة الروابط' },
      { status: 500 }
    );
  }
}
