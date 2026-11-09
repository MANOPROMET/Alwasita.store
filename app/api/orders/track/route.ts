// app/api/orders/track/route.ts
import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

function maskPhone(phone: string): string {
  const clean = phone.trim();
  if (clean.length <= 4) return '****';
  return clean.slice(0, 3) + '****' + clean.slice(-3);
}

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. فحص معدل الاستعلام لمنع هجمات استخراج أرقام وبيانات العملاء (Enumeration): 10 استعلامات بالدقيقة
    const rateCheck = checkRateLimit(`order-track:${clientIp}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح به لعمليات البحث. يرجى الانتظار دقيقة واحدة.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get('phone');

    if (!rawPhone || rawPhone.trim().length < 8) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف مكتمل لا يقل عن 8 أرقام' },
        { status: 400 }
      );
    }

    // تنظيف رقم الهاتف للبحث
    const cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف صحيح' },
        { status: 400 }
      );
    }

    // جلب آخر الطلبات المسجلة
    const response = await databases.listDocuments(
      DATABASE_ID,
      'orders',
      [
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]
    );

    // 2. مطابقة صارمة وآمنة للرقم تمنع تسريب بيانات العملاء الآخرين
    const matchedOrders = (response.documents || []).filter((doc: any) => {
      const orderPhone = (doc.customerPhone || '').replace(/\D/g, '');
      if (!orderPhone || orderPhone.length < 8) return false;

      // أ) تطابق تام للرقم
      if (orderPhone === cleanPhone) return true;

      // ب) تطابق الأرقام الأساسية الأخيرة (لتفادي اختلاف مفتاح الدولة مثل 967 أو 00967 أو 0)
      const minLen = 8;
      const cleanTail = cleanPhone.slice(-minLen);
      const orderTail = orderPhone.slice(-minLen);
      return cleanTail === orderTail && (cleanPhone.length >= 9 || orderPhone.length >= 9);
    });

    // 3. تقليل البيانات الحساسة المعروضة (Data Minimization)
    const orders = matchedOrders.map((o: any) => ({
      id: o.$id,
      shortId: o.$id.slice(-6).toUpperCase(),
      customerName: o.customerName,
      customerPhone: maskPhone(o.customerPhone || cleanPhone),
      customerAddress: o.customerAddress,
      totalAmount: o.totalAmount,
      currency: o.currency || 'YER',
      status: o.status || 'pending',
      createdAt: o.$createdAt,
    }));

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error tracking orders:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث عن الطلبات' }, { status: 500 });
  }
}
