// app/api/orders/track/route.ts
import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get('phone');

    if (!rawPhone || rawPhone.trim().length < 6) {
      return NextResponse.json({ error: 'يرجى إدخال رقم هاتف صحيح' }, { status: 400 });
    }

    // تنظيف رقم الهاتف للبحث
    const cleanPhone = rawPhone.replace(/\D/g, '');

    // جلب آخر الطلبات للبحث عن تطابق رقم الهاتف
    const response = await databases.listDocuments(
      DATABASE_ID,
      'orders',
      [
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]
    );

    // تصفية الطلبات التي يطابق رقم هاتفها الرقم المدخل
    const matchedOrders = (response.documents || []).filter((doc: any) => {
      const orderPhone = (doc.customerPhone || '').replace(/\D/g, '');
      return orderPhone.includes(cleanPhone) || cleanPhone.includes(orderPhone);
    });

    const orders = matchedOrders.map((o: any) => ({
      id: o.$id,
      shortId: o.$id.slice(-6).toUpperCase(),
      customerName: o.customerName,
      customerPhone: o.customerPhone,
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
