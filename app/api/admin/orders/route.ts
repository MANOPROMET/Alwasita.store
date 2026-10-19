import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

// 1. جلب كافة الطلبات مع عناصرها
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];
    if (status && status !== 'all') {
      queries.push(Query.equal('status', status));
    }

    const [ordersRes, itemsRes] = await Promise.all([
      databases.listDocuments(DATABASE_ID, 'orders', queries),
      databases.listDocuments(DATABASE_ID, 'order_items', [Query.limit(500)]),
    ]);

    const orders = ordersRes.documents;
    const items = itemsRes.documents;

    // ربط عناصر كل طلب به
    const fullOrders = orders.map((order) => {
      const orderItems = items.filter((item: any) => {
        const oRef = item.order;
        if (!oRef) return false;
        if (typeof oRef === 'string') return oRef === order.$id;
        return oRef?.$id === order.$id;
      });

      return {
        ...order,
        items: orderItems,
      };
    });

    return NextResponse.json({ success: true, orders: fullOrders });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}

// 2. تحديث حالة الطلب
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'معرف الطلب والحالة الجديدة مطلوبان' },
        { status: 400 }
      );
    }

    // جلب معرفات عناصر الطلب لتمريرها مع التحديث لضمان مطابقة بنية العلاقة في Appwrite
    const itemsRes = await databases.listDocuments(DATABASE_ID, 'order_items', [
      Query.equal('order', orderId),
    ]);
    const itemIds = itemsRes.documents.map((d) => d.$id);

    const updatePayload: any = { status };
    if (itemIds.length > 0) {
      updatePayload.items = itemIds;
    }

    const updated = await databases.updateDocument(
      DATABASE_ID,
      'orders',
      orderId,
      updatePayload
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث حالة الطلب' },
      { status: 500 }
    );
  }
}

// 3. حذف طلب (فردي أو جماعي)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    let targetIds: string[] = [];
    if (idsParam) {
      targetIds = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
    } else if (orderId) {
      targetIds = [orderId.trim()];
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body?.ids)) {
          targetIds = body.ids;
        }
      } catch (_) {}
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ error: 'معرف الطلب أو المعرفات مطلوبة' }, { status: 400 });
    }

    for (const id of targetIds) {
      // 1. حذف عناصر الطلب أولاً
      const items = await databases.listDocuments(DATABASE_ID, 'order_items', [
        Query.equal('order', id),
      ]);
      await Promise.all(
        items.documents.map((item) =>
          databases.deleteDocument(DATABASE_ID, 'order_items', item.$id)
        )
      );

      // 2. حذف مستند الطلب
      await databases.deleteDocument(DATABASE_ID, 'orders', id);
    }

    return NextResponse.json({ success: true, count: targetIds.length });
  } catch (error: any) {
    console.error('Error deleting order(s):', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف الطلبات' },
      { status: 500 }
    );
  }
}
