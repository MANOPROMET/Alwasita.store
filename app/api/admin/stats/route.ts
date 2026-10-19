import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export async function GET() {
  try {
    const [productsRes, categoriesRes, ordersRes, bannersRes] = await Promise.all([
      databases.listDocuments(DATABASE_ID, 'products', [Query.limit(200)]),
      databases.listDocuments(DATABASE_ID, 'categories', [Query.limit(50)]),
      databases.listDocuments(DATABASE_ID, 'orders', [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]),
      databases.listDocuments(DATABASE_ID, 'banners', [Query.limit(50)]),
    ]);

    const products = productsRes.documents;
    const categories = categoriesRes.documents;
    const orders = ordersRes.documents;
    const banners = bannersRes.documents;

    const activeProducts = products.filter((p: any) => p.isActive).length;
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    const confirmedOrders = orders.filter((o: any) => o.status === 'confirmed').length;
    const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;

    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (Number(o.totalAmount) || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: products.length,
        activeProducts,
        totalCategories: categories.length,
        totalOrders: orders.length,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        totalRevenue,
        totalBanners: banners.length,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب إحصائيات لوحة التحكم' },
      { status: 500 }
    );
  }
}
