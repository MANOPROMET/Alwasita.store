// app/api/admin/bio/links/reorder/route.ts
import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: Array<{ id: string; sortOrder: number }> };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'قائمة الترتيب غير صالحة' }, { status: 400 });
    }

    await Promise.all(
      items.map((item) =>
        databases.updateDocument(DATABASE_ID, 'bio_links', item.id, {
          sortOrder: Math.floor(item.sortOrder),
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering bio links:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ الترتيب' },
      { status: 500 }
    );
  }
}
