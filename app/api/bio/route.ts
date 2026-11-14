// app/api/bio/route.ts
import { NextResponse } from 'next/server';
import { getBioSettings, getBioLinks } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/server';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [settings, links] = await Promise.all([
      getBioSettings(),
      getBioLinks(false),
    ]);
    return NextResponse.json({ success: true, settings, links });
  } catch (error: any) {
    console.error('Error fetching bio data:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب بيانات الروابط' },
      { status: 500 }
    );
  }
}

// تسجيل النقرات على الروابط للإحصائيات بدون تعطيل المستخدم
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { linkId } = body;
    if (!linkId) {
      return NextResponse.json({ error: 'معرف الرابط مطلوب' }, { status: 400 });
    }

    try {
      const doc = await databases.getDocument(DATABASE_ID, 'bio_links', linkId);
      const currentClicks = Number(doc.clicks) || 0;
      await databases.updateDocument(DATABASE_ID, 'bio_links', linkId, {
        clicks: currentClicks + 1,
      });
    } catch {
      // ignore silently if doc missing
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
